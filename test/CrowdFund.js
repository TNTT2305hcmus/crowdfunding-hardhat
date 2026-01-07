const {
    loadFixture,
    time,
} = require('@nomicfoundation/hardhat-toolbox/network-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');


describe("CrowdFund Smart Contract", function(){
    // Hàm này dùng để setup môi trường chuẩn trước mỗi bài test.
    // Giúp tiết kiệm thời gian, không phải deploy lại từ đầu cho mỗi test case.
    async function deployCrowdFundFixture(){
        const [manager, contributor1, contributor2] = await ethers.getSigners();

        // 10 ETH = 10 * 10^18 wei
        const GOAL = ethers.parseEther("10");
        const DURATION = 3600; // 3600s

        // Deploy
        const CrowdFund = await ethers.getContractFactory("CrowdFund");
        const crowdFund = await CrowdFund.deploy(GOAL, DURATION);

        // Return
        return { crowdFund, manager, contributor1, contributor2, GOAL, DURATION };
    }

    // Kiểm tra việc Deployment
    describe("Deployment", function (){
        it("Should set the right manager", async function () {
            const {crowdFund, manager} = await loadFixture(deployCrowdFundFixture);
            // Kiểm tra xem biến manager trong contract có bằng địa chỉ ví người deploy không
            expect(await crowdFund.manager()).to.equal(manager.address);
        })

        it("Should set the right goal", async function () {
        const { crowdFund, GOAL } = await loadFixture(deployCrowdFundFixture);
        expect(await crowdFund.goal()).to.equal(GOAL);
        });

        it("Should fail if goal is 0", async function () {
            // Đây là bài tập nhỏ: Logic này chưa xử lý trong Contract.
            // Bạn cứ chạy test để xem nó hoạt động thế nào đã.
        });
    });

    describe("Pledging", function () {
        it("Should allow contributor to pledge", async function (){
            const { crowdFund, contributor1 } = await loadFixture(deployCrowdFundFixture);

            // contributor1 góp 1 ETH
            // connect(contributor1) -> Giả lập contributor1 gọi hàm pledge
            await crowdFund.connect(contributor1).pledge({ value: ethers.parseEther("1") });

            // Kiểm tra xem biến mapping pledged đã cập nhật giá trị tại địa chỉ này hay chưa
            expect(await crowdFund.pledged(contributor1.address)).to.equal(ethers.parseEther("1"));

            // Kiểm tra tổng tiền đã tăng chưa
            expect(await crowdFund.pledgeAmount()).to.equal(ethers.parseEther("1")); 
        })

        it("Show emit Pledge event", async function () {
            const {crowdFund, contributor1} = await loadFixture(deployCrowdFundFixture);
            
            // Kiểm tra xem có bắn ra event như mong đợi
            await expect(crowdFund.connect(contributor1).pledge({value: ethers.parseEther("1")}))
            .to.emit(crowdFund, "Pledge")
            .withArgs(contributor1.address, ethers.parseEther("1"));
        });

        it("Should fail if deadline passed", async function () {
            const {crowdFund, contributor1, DURATION} = await loadFixture(deployCrowdFundFixture);

            // --- HACK TIME TO TEST ---
            // pass dealine 1 second
            await time.increase(DURATION + 1);

            // Lúc này gọi hàm pledge() sẽ báo lỗi
            await expect(crowdFund.connect(contributor1).pledge({value: ethers.parseEther("1")}))
            .to.be.revertedWith("Deadline passed");
        });

        it("Should fail if value: 0", async function (){
            const {crowdFund, contributor1} = await loadFixture(deployCrowdFundFixture);

            await expect(crowdFund.connect(contributor1).pledge({value: 0}))
            .to.be.revertedWith("Value must be > 0");
        });
    });

    describe("Widraw & Refund", function () {
        // Rút tiền thành công
        it("Should allow manager to withdraw if goal met ", async function () {
            const {crowdFund, manager, contributor1, contributor2, DURATION, GOAL} = await loadFixture(deployCrowdFundFixture);

            // Pledge -> PledgeAmount > GOAL
            await crowdFund.connect(contributor1).pledge({value: ethers.parseEther("5")})
            await crowdFund.connect(contributor2).pledge({value: ethers.parseEther("5")})

            // --- HACK TIME TO TEST ---
            await time.increase(DURATION + 1);

            // Manager withdraws
            // Kiểm tra ví manager tăng 10 ETH <-> Ví contract giảm 10 ETH
            await expect(crowdFund.connect(manager).withdraw())
            .to.changeEtherBalances(
                [manager, crowdFund],
                [GOAL, -GOAL]
            );
        })

        // Hoàn tiền
        it("Should allow contributor to refund if goal NOT met", async function () {
        const { crowdFund, contributor1, DURATION } = await loadFixture(deployCrowdFundFixture);
        
        // Pledge -> PledgeAmount < GOAL
        await crowdFund.connect(contributor1).pledge({value: ethers.parseEther("1")})

        // --- HACK TIME TO TEST ---
        await time.increase(DURATION + 1);

        // contributor call refund()
        // Kiểm tra xem ví contributor tăng pledged[contributor.address], ví contract giảm tương ứng
        await expect(crowdFund.connect(contributor1).refund())
            .to.changeEtherBalances(
            [contributor1, crowdFund], 
            [ethers.parseEther("1"), -ethers.parseEther("1")]
            );
        });
    });
});