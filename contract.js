// contracts.js - FULL VERSION
console.log('📄 Loading contracts.js...');

const CONTRACT_ADDRESSES = {
    GAS_TOKEN: "0xF5Cd132Da2F0EC2150E4C0Ac5a2A9473649DF307",
    BGS_TOKEN: "0x34897515163C21f9eA0600A3d0308E1430404f55", 
    STAKING: "0xc4079F735425002312c3B60A66cff56576A34a44"
};

console.log('✅ Contract addresses loaded:', CONTRACT_ADDRESSES);

// GAS Token ABI (Simplified)
const GAS_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "spender", "type": "address"},
            {"name": "amount", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {"name": "owner", "type": "address"},
            {"name": "spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{"name": "value", "type": "uint256"}],
        "name": "burn",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "to", "type": "address"},
            {"name": "amount", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    }
];

// BGS Token ABI (Simplified)
const BGS_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "spender", "type": "address"},
            {"name": "amount", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {"name": "owner", "type": "address"},
            {"name": "spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{"name": "value", "type": "uint256"}],
        "name": "burn",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    }
];

// Staking Contract ABI (Simplified)
const STAKING_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "GAS_TOKEN",
        "outputs": [{"name": "", "type": "address"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "BGS_TOKEN",
        "outputs": [{"name": "", "type": "address"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalStaked",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalStakers",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "user", "type": "address"}],
        "name": "getUserStakeInfo",
        "outputs": [
            {"name": "amount", "type": "uint256"},
            {"name": "stakedAt", "type": "uint256"}, 
            {"name": "unlockTime", "type": "uint256"},
            {"name": "pendingRewards", "type": "uint256"},
            {"name": "totalEarned", "type": "uint256"},
            {"name": "userShare", "type": "uint256"}
        ],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getStakingStats", 
        "outputs": [
            {"name": "totalStakedGAS", "type": "uint256"},
            {"name": "totalStakersCount", "type": "uint256"},
            {"name": "remainingBGS", "type": "uint256"},
            {"name": "currentAPY", "type": "uint256"}
        ],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "user", "type": "address"}],
        "name": "calculatePendingRewards",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{"name": "amount", "type": "uint256"}],
        "name": "stake",
        "outputs": [],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "withdrawRewards", 
        "outputs": [],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{"name": "amount", "type": "uint256"}],
        "name": "returnBGSToPool",
        "outputs": [],
        "type": "function"
    }
];

console.log('✅ All ABIs loaded successfully');
console.log('GAS_ABI functions:', GAS_ABI.length);
console.log('BGS_ABI functions:', BGS_ABI.length); 
console.log('STAKING_ABI functions:', STAKING_ABI.length);
