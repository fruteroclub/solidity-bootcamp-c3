
# 🧪 Clase práctica: Construyendo una plataforma de Staking y Recompensas en Solidity

🎥 Video de la clase: [YouTube - Contrato de Staking en Solidity](https://www.youtube.com/watch?v=W8EUsR55OqI)

Este repositorio acompaña a la clase práctica donde creamos un contrato de staking simple pero funcional, explorando conceptos fundamentales de DeFi, recompensas, penalizaciones y pruebas automatizadas con Foundry.

---

## 🎯 ¿Qué vas a construir?
Un contrato inteligente en Solidity que permite:
- Stakear un token ERC20
- Acumular recompensas en otro token ERC20 (modelo de distribución "pull")
- Reclamar recompensas acumuladas
- Hacer "unstake" con penalización del 10% de las recompensas, las cuales van al owner

La interfaz frontend permite:
- Conectarse con wallet (via RainbowKit)
- Visualizar tu stake y recompensas acumuladas
- Realizar acciones de stake, claim y unstake

---

## 🧠 ¿Qué vas a aprender?
- Patrón de recompensas tipo **pull** (pre-financiadas en el contrato)
- Alternativa mint-on-demand (recompensas minteadas al momento del claim)
- Seguridad: patrón checks-effects-interactions, evitar reentrancy
- Optimización de gas con `unchecked`
- Fuzz testing en Foundry para validar propiedades lógicas del contrato

---

## 🧱 Estructura del repositorio
```
staking-yieldfarm/
├── contract/        → Contrato y pruebas (Foundry)
├── frontend/        → Interfaz Web3 en Next.js *No terminado
└── README.md
```

---

## ⚙️ Setup rápido

### Requisitos
```bash
# Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup

# Node.js + pnpm o yarn
npm install -g yarn
```

### Pegar el codigo de los contratos y correr
```bash

# Contrato
cd contract
forge install
forge build
forge test --gas-report

# Frontend
cd ../frontend
npm install
npm run dev
```

---

## ⚒️ Modelo de recompensas explicado

### ✅ Modelo Pull (usado en este ejercicio)
El contrato debe tener tokens de recompensa depositados previamente. Cada usuario acumula recompensas por segundo según su stake y puede reclamarlas en cualquier momento.
```solidity
rewardToken.transfer(msg.sender, reward);
```
✅ Compatible con cualquier ERC20 estándar. Recomendado para producción y tokens ya emitidos.

### 🪙 Modelo Mint-on-Demand (opcional)
El contrato mintea tokens al momento de hacer `claimRewards()`.
```solidity
IRewardToken(address(rewardToken)).mint(msg.sender, reward);
```
⚠️ Requiere que el `rewardToken` tenga función `mint()` accesible. Útil para testnet o tokens inflacionarios.

---

## 🧪 Fuzz Testing con Foundry
El fuzz testing nos permite enviar entradas aleatorias para encontrar errores lógicos, como desbordamientos, errores de acumulación, condiciones de borde, etc.

### 🔹 Ejemplo básico de fuzz test en `test/Staking.t.sol`
```solidity
function testFuzzStakeAndUnstake(uint256 amount) public {
    amount = bound(amount, 1 ether, 1000 ether);
    ...
    staking.stake(amount);
    vm.warp(block.timestamp + 5);
    staking.unstake();
}
```
✅ `bound()` limita los valores de entrada
✅ `vm.warp()` simula el paso del tiempo
✅ `forge test` ejecutará cientos de combinaciones automáticamente

### 🏁 Ejecutar fuzz tests
```bash
forge test -vvvv
```

Foundry ejecutará funciones de prueba con argumentos aleatorios y te mostrará cualquier combinación que rompa tus asserts.

---

## 🧑‍🏫 Recomendaciones para ver la clase
1. Abre el video: https://www.youtube.com/watch?v=W8EUsR55OqI
2. Clona este repo y sigue los pasos desde `contract/`
3. Lee y ejecuta el contrato paso a paso
4. Corre las pruebas y modifica algunas para probar otros casos
5. Explora el frontend y realiza acciones desde la UI

---

## 📘 Recursos adicionales
- [Foundry Book](https://book.getfoundry.sh/)
- [RainbowKit](https://www.rainbowkit.com/)
- [wagmi.sh](https://wagmi.sh/)
- [Guía de Fuzz Testing en Solidity](https://docs.soliditylang.org/en/latest/control-structures.html#assert-and-require)

---

---

### Transacciones hechas en la Red Scroll durante la Clase
- [Despliegue ERC20 Token Fruta-Staking](https://scroll.blockscout.com/tx/0x8d25aef687eddfd7d08050449b575383e1e67b6e5cd46a410be3c4a5d8067766)
- [Despliegue ERC20 Token Fruta-Reward](https://scroll.blockscout.com/tx/0x04062c76c6b3b188195c6b06cad1bbe3f274a245dedb25636510a8e1c027199b)
- [Despliegue Staking Contract compatible con el token Fruta-Staking](https://scroll.blockscout.com/tx/0x81a114c16d796bee8b515a877bec650b94bc8fdd196ba6a113cae556b4ad4d15)
- [Transaccion Fallida de Deposit por no haber ejecutado el approve anteriormente](https://scroll.blockscout.com/tx/0x72b0a5baa06484cddd5cc3359b1d023d242b155b12339c9e72764afb5ad7a7b3?tab=index)
- [Transaccion Deposit exitosa de un token FTS](https://scroll.blockscout.com/tx/0xe3b366db3b4372befb342ecc6b0627c68d387a33738d454b422b22fcc3412f89)

---

**Note que este codigo se uso con fines educativos y no se recomienda su uso en produccion**

Hecho con 💚 para ayudarte a convertirte en un mejor desarrollador DeFi.

