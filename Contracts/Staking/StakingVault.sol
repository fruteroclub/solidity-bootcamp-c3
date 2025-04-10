// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ✅ Importamos la interfaz ERC20 estándar
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Staking
 * @notice Contrato que permite hacer staking de un token ERC20 y reclamar recompensas acumuladas en otro token.
 * @dev Este contrato repasa conceptos clave como storage, uso de block.timestamp, seguridad en claim, y optimización de gas.
 */
contract Staking {
    // ✅ Referencia al token que los usuarios stakean
    IERC20 public stakingToken;

    // ✅ Referencia al token usado como recompensa
    IERC20 public rewardToken;

    // ✅ Tasa de recompensa por segundo (expresada en 1e18 = 1.0)
    // Por cada segundo que stakeas, acumulas esta cantidad de rewardToken
    uint256 public rewardRate = 1e16; // 0.01 tokens/segundo

    // ✅ TRACKERS de staking
    mapping(address => uint256) public stakes;         // Monto total stakeado por cada usuario
    mapping(address => uint256) public lastUpdated;    // Última vez que se actualizaron sus rewards
    mapping(address => uint256) public rewards;        // Recompensas acumuladas aún no reclamadas

    constructor(address _stakingToken, address _rewardToken) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    /**
     * @notice Función para depositar tokens y empezar a acumular recompensas.
     * @dev Aquí usamos `transferFrom`, lo que requiere que el usuario apruebe previamente al contrato.
     */
    function deposit(uint256 amount) external {
        require(amount > 0, "amount = 0");

        // ✅ Antes de actualizar balances, actualizamos recompensas acumuladas
        _updateRewards(msg.sender);

        // Transferimos los tokens stakeados al contrato
        stakingToken.transferFrom(msg.sender, address(this), amount);

        // Sumamos al staking total del usuario
        stakes[msg.sender] += amount;
    }

    /**
     * @notice Reclama las recompensas acumuladas y las transfiere al usuario.
     * @dev El uso del patrón "pull" reduce el riesgo de reentrancy.
     */
    function claimRewards() external {
        _updateRewards(msg.sender);

        uint256 reward = rewards[msg.sender];
        require(reward > 0, "no rewards");

        // ✅ Resetear antes de transferir para evitar reentrancy
        rewards[msg.sender] = 0;

        // ✅ Usamos transfer (no call), lo que evita fallback vulnerables
        rewardToken.transfer(msg.sender, reward);
    }

    /**
     * @dev Función interna para calcular las recompensas acumuladas desde el último update
     */
    function _updateRewards(address user) internal {
        // ✅ Solo actualiza si el usuario tiene staking
        if (stakes[user] > 0) {
            uint256 timeElapsed = block.timestamp - lastUpdated[user];

            // Recompensas = segundos * tasa fija (simplificado)
            // En casos reales esto se basaría en proporciones de totalSupply
            rewards[user] += timeElapsed * rewardRate;
        }

        // ✅ Guardamos el tiempo de actualización actual
        lastUpdated[user] = block.timestamp;
    }

    /**
     * @notice Permite consultar en tiempo real las recompensas aún no reclamadas
     */
    function getPendingRewards(address user) external view returns (uint256) {
        if (stakes[user] == 0) return rewards[user];

        uint256 timeElapsed = block.timestamp - lastUpdated[user];
        return rewards[user] + (timeElapsed * rewardRate);
    }
}