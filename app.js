// app.js - FULLY FIXED VERSION
class IritnomicDapp {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.contracts = {};
        this.isConnected = false;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing IRITnomic DApp...');
            
            await this.loadWeb3();
            await this.loadContracts();
            this.loadEventListeners();
            
            if (this.isConnected && this.areContractsLoaded()) {
                await this.loadWalletData();
            }
            
            this.isInitialized = true;
            console.log('✅ DApp initialized successfully');
            this.showStatus('DApp ready - Connect your wallet to start', 'info');
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.showStatus('DApp initialization failed: ' + error.message, 'error');
        }
    }

    areContractsLoaded() {
        return this.contracts.gasToken && this.contracts.bgsToken && this.contracts.staking;
    }

    async loadWeb3() {
        if (window.ethereum) {
            try {
                this.web3 = new Web3(window.ethereum);
                console.log('🔗 Web3 initialized');

                // Check current network
                const chainId = await this.web3.eth.getChainId();
                console.log('🌐 Current chain ID:', chainId);
                
                if (chainId !== 97) {
                    this.showStatus('Please switch to BSC Testnet (ChainId: 97)', 'error');
                    this.updateConnectionStatus(false);
                    return;
                }

                // Check existing accounts
                const accounts = await this.web3.eth.getAccounts();
                console.log('📱 Found accounts:', accounts);
                
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    this.isConnected = true;
                    this.updateConnectionStatus(true);
                    console.log('✅ Auto-connected to account:', this.account);
                }

                // Setup event listeners
                this.setupEventListeners();

            } catch (error) {
                console.error('❌ Web3 initialization error:', error);
                this.showStatus('Failed to initialize Web3: ' + error.message, 'error');
            }
        } else {
            this.showStatus('Please install MetaMask or another Web3 wallet!', 'error');
        }
    }

    setupEventListeners() {
        window.ethereum.on('accountsChanged', (accounts) => {
            this.handleAccountsChanged(accounts);
        });

        window.ethereum.on('chainChanged', (chainId) => {
            this.handleChainChanged(chainId);
        });

        window.ethereum.on('connect', (connectInfo) => {
            console.log('🔗 Wallet connected:', connectInfo);
            this.handleWalletConnect();
        });

        window.ethereum.on('disconnect', (error) => {
            console.log('🔴 Wallet disconnected:', error);
            this.handleWalletDisconnect();
        });
    }

    handleAccountsChanged(accounts) {
        console.log('🔄 Accounts changed:', accounts);
        this.account = accounts[0] || null;
        this.isConnected = !!this.account;
        this.updateConnectionStatus(this.isConnected);
        
        if (this.isConnected && this.areContractsLoaded()) {
            this.loadWalletData();
        } else {
            this.resetUI();
        }
    }

    handleChainChanged(chainId) {
        console.log('🔄 Chain changed:', chainId);
        const newChainId = parseInt(chainId, 16);
        
        if (newChainId === 97) {
            this.showStatus('Connected to BSC Testnet', 'success');
            if (this.account) {
                this.loadWalletData();
            }
        } else {
            this.showStatus('Please switch to BSC Testnet (ChainId: 97)', 'error');
            this.updateConnectionStatus(false);
        }
    }

    handleWalletConnect() {
        console.log('✅ Wallet connected');
        this.updateConnectionStatus(true);
    }

    handleWalletDisconnect() {
        console.log('🔴 Wallet disconnected');
        this.isConnected = false;
        this.account = null;
        this.updateConnectionStatus(false);
        this.resetUI();
    }

    async loadContracts() {
        if (!this.web3) {
            throw new Error('Web3 not initialized');
        }

        try {
            console.log('📄 Loading contracts...');
            
            // Validate contract addresses
            this.validateContractAddresses();
            
            // Initialize contracts with timeout
            await Promise.race([
                this.initializeContracts(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Contract loading timeout')), 10000)
                )
            ]);
            
            // Test contract connections
            await this.testContractConnection();
            
            console.log('✅ All contracts loaded successfully');
            
        } catch (error) {
            console.error('❌ Contract loading failed:', error);
            throw new Error(`Failed to load contracts: ${error.message}`);
        }
    }

    validateContractAddresses() {
        const { GAS_TOKEN, BGS_TOKEN, STAKING } = CONTRACT_ADDRESSES;
        
        if (!GAS_TOKEN || !BGS_TOKEN || !STAKING) {
            throw new Error('Contract addresses not defined');
        }
        
        if (!this.isValidAddress(GAS_TOKEN) || !this.isValidAddress(BGS_TOKEN) || !this.isValidAddress(STAKING)) {
            throw new Error('Invalid contract address format');
        }
    }

    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    async initializeContracts() {
        if (!GAS_ABI || !BGS_ABI || !STAKING_ABI) {
            throw new Error('Contract ABIs not defined');
        }

        this.contracts = {
            gasToken: new this.web3.eth.Contract(GAS_ABI, CONTRACT_ADDRESSES.GAS_TOKEN),
            bgsToken: new this.web3.eth.Contract(BGS_ABI, CONTRACT_ADDRESSES.BGS_TOKEN),
            staking: new this.web3.eth.Contract(STAKING_ABI, CONTRACT_ADDRESSES.STAKING)
        };

        console.log('📝 Contract instances created');
    }

    async testContractConnection() {
        try {
            // Test GAS token
            const gasSymbol = await this.contracts.gasToken.methods.symbol().call();
            console.log('✅ GAS Token connected:', gasSymbol);
            
            // Test BGS token  
            const bgsSymbol = await this.contracts.bgsToken.methods.symbol().call();
            console.log('✅ BGS Token connected:', bgsSymbol);
            
            // Test staking contract
            const gasTokenAddress = await this.contracts.staking.methods.GAS_TOKEN().call();
            console.log('✅ Staking contract connected. GAS Token:', gasTokenAddress);
            
        } catch (error) {
            console.error('❌ Contract connection test failed:', error);
            throw new Error(`Contract connection failed: ${error.message}`);
        }
    }

    loadEventListeners() {
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());
        document.getElementById('stakeBtn').addEventListener('click', () => this.stake());
        document.getElementById('withdrawRewardsBtn').addEventListener('click', () => this.withdrawRewards());
        document.getElementById('burnGasBtn').addEventListener('click', () => this.burnGas());
        document.getElementById('recycleBgsBtn').addEventListener('click', () => this.recycleBgs());
        
        console.log('🎯 Event listeners loaded');
    }

    async connectWallet() {
        try {
            this.showStatus('Connecting wallet...', 'info');
            
            // Request account access
            await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            // Get accounts
            const accounts = await this.web3.eth.getAccounts();
            this.account = accounts[0];
            this.isConnected = true;
            
            this.updateConnectionStatus(true);
            await this.loadWalletData();
            
            this.showStatus('Wallet connected successfully!', 'success');
            console.log('✅ Wallet connected:', this.account);
            
        } catch (error) {
            console.error('❌ Wallet connection error:', error);
            
            if (error.code === 4001) {
                this.showStatus('User denied wallet connection', 'error');
            } else {
                this.showStatus('Wallet connection failed: ' + error.message, 'error');
            }
        }
    }

    async loadWalletData() {
        if (!this.account || !this.areContractsLoaded()) {
            return;
        }

        try {
            console.log('📊 Loading wallet data...');
            
            // Load token balances
            const [gasBalance, bgsBalance] = await Promise.all([
                this.contracts.gasToken.methods.balanceOf(this.account).call(),
                this.contracts.bgsToken.methods.balanceOf(this.account).call()
            ]);

            document.getElementById('gasBalance').textContent = 
                this.formatNumber(this.web3.utils.fromWei(gasBalance, 'ether'));
            document.getElementById('bgsBalance').textContent = 
                this.formatNumber(this.web3.utils.fromWei(bgsBalance, 'ether'));

            // Load staking info
            await this.loadStakingInfo();
            this.updateWalletInfo();

            console.log('✅ Wallet data loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading wallet data:', error);
            this.showStatus('Failed to load wallet data: ' + error.message, 'error');
        }
    }

    async loadStakingInfo() {
        try {
            const [stakeInfo, stakingStats] = await Promise.all([
                this.contracts.staking.methods.getUserStakeInfo(this.account).call(),
                this.contracts.staking.methods.getStakingStats().call()
            ]);

            const [amount, stakedAt, unlockTime, pendingRewards, totalEarned, userShare] = stakeInfo;
            const [totalStaked, totalStakers, remainingBGS, currentAPY] = stakingStats;

            // Update UI
            document.getElementById('userStake').textContent = 
                this.formatNumber(this.web3.utils.fromWei(amount, 'ether')) + ' GAS';
            document.getElementById('userShare').textContent = 
                (userShare / 100).toFixed(2) + '%';
            document.getElementById('totalStaked').textContent = 
                this.formatNumber(this.web3.utils.fromWei(totalStaked, 'ether')) + ' GAS';
            document.getElementById('pendingRewards').textContent = 
                this.formatNumber(this.web3.utils.fromWei(pendingRewards, 'ether')) + ' BGS';

            // Update APY badge
            document.getElementById('apyBadge').textContent = 
                (currentAPY / 10) + '% APY • ' + totalStakers + ' STAKERS';

        } catch (error) {
            console.error('❌ Error loading staking info:', error);
            // Don't show error if user hasn't staked yet
            if (!error.message.includes('User has no stake')) {
                this.showStatus('Failed to load staking info: ' + error.message, 'error');
            }
        }
    }

    async stake() {
        if (!this.validateStakingPreconditions()) {
            return;
        }

        const amount = document.getElementById('stakeAmount').value;
        if (!amount || amount <= 0) {
            this.showStatus('Please enter a valid amount', 'error');
            return;
        }

        try {
            const amountWei = this.web3.utils.toWei(amount, 'ether');
            
            // Check current allowance
            const currentAllowance = await this.contracts.gasToken.methods
                .allowance(this.account, CONTRACT_ADDRESSES.STAKING)
                .call();

            // Approve if needed
            if (BigInt(currentAllowance) < BigInt(amountWei)) {
                this.showStatus('Approving GAS tokens...', 'info');
                
                await this.contracts.gasToken.methods
                    .approve(CONTRACT_ADDRESSES.STAKING, amountWei)
                    .send({ from: this.account });
                    
                this.showStatus('Approval successful!', 'success');
            }

            // Execute stake
            this.showStatus('Staking GAS tokens...', 'info');
            
            await this.contracts.staking.methods.stake(amountWei)
                .send({ from: this.account });

            this.showStatus(`Successfully staked ${amount} GAS!`, 'success');
            
            // Refresh data
            await this.loadWalletData();
            
            // Clear input
            document.getElementById('stakeAmount').value = '';

        } catch (error) {
            console.error('❌ Staking error:', error);
            this.showStatus('Staking failed: ' + this.getUserFriendlyError(error), 'error');
        }
    }

    async withdrawRewards() {
        if (!this.validateStakingPreconditions()) {
            return;
        }

        try {
            this.showStatus('Withdrawing rewards...', 'info');
            
            await this.contracts.staking.methods.withdrawRewards()
                .send({ from: this.account });

            this.showStatus('Rewards withdrawn successfully!', 'success');
            await this.loadWalletData();

        } catch (error) {
            console.error('❌ Withdraw error:', error);
            this.showStatus('Withdraw failed: ' + this.getUserFriendlyError(error), 'error');
        }
    }

    async burnGas() {
        if (!this.validateStakingPreconditions()) {
            return;
        }

        const amount = document.getElementById('burnGasAmount').value;
        if (!amount || amount <= 0) {
            this.showStatus('Please enter a valid amount', 'error');
            return;
        }

        try {
            const amountWei = this.web3.utils.toWei(amount, 'ether');
            
            this.showStatus('Burning GAS tokens...', 'info');
            
            await this.contracts.gasToken.methods.burn(amountWei)
                .send({ from: this.account });

            this.showStatus(`Burned ${amount} GAS successfully!`, 'success');
            await this.loadWalletData();
            
            // Clear input
            document.getElementById('burnGasAmount').value = '';

        } catch (error) {
            console.error('❌ Burn error:', error);
            this.showStatus('Burn failed: ' + this.getUserFriendlyError(error), 'error');
        }
    }

    async recycleBgs() {
        if (!this.validateStakingPreconditions()) {
            return;
        }

        const amount = document.getElementById('recycleBgsAmount').value;
        if (!amount || amount <= 0) {
            this.showStatus('Please enter a valid amount', 'error');
            return;
        }

        try {
            const amountWei = this.web3.utils.toWei(amount, 'ether');

            // Check current allowance
            const currentAllowance = await this.contracts.bgsToken.methods
                .allowance(this.account, CONTRACT_ADDRESSES.STAKING)
                .call();

            // Approve if needed
            if (BigInt(currentAllowance) < BigInt(amountWei)) {
                this.showStatus('Approving BGS tokens...', 'info');
                
                await this.contracts.bgsToken.methods
                    .approve(CONTRACT_ADDRESSES.STAKING, amountWei)
                    .send({ from: this.account });
                    
                this.showStatus('Approval successful!', 'success');
            }

            // Return to pool
            this.showStatus('Recycling BGS to pool...', 'info');
            
            await this.contracts.staking.methods.returnBGSToPool(amountWei)
                .send({ from: this.account });

            this.showStatus(`Recycled ${amount} BGS to pool!`, 'success');
            await this.loadWalletData();
            
            // Clear input
            document.getElementById('recycleBgsAmount').value = '';

        } catch (error) {
            console.error('❌ Recycle error:', error);
            this.showStatus('Recycle failed: ' + this.getUserFriendlyError(error), 'error');
        }
    }

    validateStakingPreconditions() {
        if (!this.isConnected) {
            this.showStatus('Please connect your wallet first', 'error');
            return false;
        }
        
        if (!this.areContractsLoaded()) {
            this.showStatus('Contracts not loaded. Please refresh the page', 'error');
            return false;
        }
        
        if (!this.account) {
            this.showStatus('No account connected', 'error');
            return false;
        }
        
        return true;
    }

    getUserFriendlyError(error) {
        const message = error.message || error.toString();
        
        if (message.includes('user denied transaction')) {
            return 'Transaction was cancelled';
        }
        if (message.includes('insufficient funds')) {
            return 'Insufficient balance for transaction';
        }
        if (message.includes('execution reverted')) {
            // Extract revert reason if possible
            const revertMatch = message.match(/execution reverted: ([^"]*)/);
            return revertMatch ? `Transaction failed: ${revertMatch[1]}` : 'Transaction failed: Contract execution reverted';
        }
        if (message.includes('Network error')) {
            return 'Network error. Please check your connection';
        }
        
        return message.length > 100 ? message.substring(0, 100) + '...' : message;
    }

    updateConnectionStatus(connected) {
        const networkDot = document.getElementById('networkDot');
        const networkName = document.getElementById('networkName');
        const connectBtn = document.getElementById('connectWallet');
        const walletInfo = document.getElementById('walletInfo');

        if (connected) {
            networkDot.className = 'status-dot connected';
            networkName.textContent = 'BSC Testnet Connected';
            connectBtn.classList.add('hidden');
            walletInfo.classList.remove('hidden');
        } else {
            networkDot.className = 'status-dot';
            networkName.textContent = 'Disconnected';
            connectBtn.classList.remove('hidden');
            walletInfo.classList.add('hidden');
            this.resetUI();
        }
    }

    updateWalletInfo() {
        const walletInfo = document.getElementById('walletInfo');
        const connectBtn = document.getElementById('connectWallet');

        if (this.account) {
            connectBtn.classList.add('hidden');
            walletInfo.classList.remove('hidden');
            document.getElementById('walletAddress').textContent = 
                this.account.substring(0, 6) + '...' + this.account.substring(38);
        } else {
            connectBtn.classList.remove('hidden');
            walletInfo.classList.add('hidden');
        }
    }

    resetUI() {
        // Reset all UI values to default
        document.getElementById('userStake').textContent = '0 GAS';
        document.getElementById('userShare').textContent = '0%';
        document.getElementById('totalStaked').textContent = '0 GAS';
        document.getElementById('pendingRewards').textContent = '0 BGS';
        document.getElementById('gasBalance').textContent = '0';
        document.getElementById('bgsBalance').textContent = '0';
        document.getElementById('stakeAmount').value = '';
        document.getElementById('burnGasAmount').value = '';
        document.getElementById('recycleBgsAmount').value = '';
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2
        }).format(num);
    }

    showStatus(message, type = 'info') {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');
        
        console.log(`📢 Status (${type}):`, message);
        
        // Auto-hide success/info messages after 5 seconds
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                status.classList.add('hidden');
            }, 5000);
        }
    }
}

// Initialize app when page loads
window.addEventListener('load', () => {
    console.log('🖥️ Page loaded, initializing DApp...');
    window.iritnomicDapp = new IritnomicDapp();
});
