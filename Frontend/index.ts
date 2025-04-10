// Codigo front page/index.ts

import { useState } from "react"
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { parseEther, formatEther } from "viem"

// 🧾 ABI mínimo para la interacción
const stakingAbi = [
  { name: "stake", type: "function", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { name: "claimRewards", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { name: "unstake", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { name: "getPendingRewards", type: "function", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "stakes", type: "function", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ type: "uint256" }] },
]

// Reemplaza con la dirección real del contrato desplegado
const stakingAddress = "0xYourContractAddressHere"

export default function Home() {
  const { address } = useAccount()
  const [stakeAmount, setStakeAmount] = useState("")

  const { data: stakeBalance } = useContractRead({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: "stakes",
    args: [address!],
    watch: true,
    enabled: Boolean(address),
  })

  const { data: pendingRewards } = useContractRead({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: "getPendingRewards",
    args: [address!],
    watch: true,
    enabled: Boolean(address),
  })

  const { config: configStake, isError } = usePrepareContractWrite({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: "stake",
    args: [parseEther(stakeAmount || "0")],
    enabled: Boolean(stakeAmount && parseFloat(stakeAmount) > 0),
  })

  const { write: stake } = useContractWrite(configStake)
  const { write: claimRewards } = useContractWrite({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: "claimRewards",
  })

  const { write: unstake } = useContractWrite({
    address: stakingAddress,
    abi: stakingAbi,
    functionName: "unstake",
  })

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "auto" }}>
      <h1>🚀 Staking dApp</h1>
      <ConnectButton />

      {address && (
        <>
          <div style={{ marginTop: "2rem" }}>
            <p><strong>Stake actual:</strong> {stakeBalance ? formatEther(stakeBalance as bigint) : "0"} TOKEN</p>
            <p><strong>Recompensas acumuladas:</strong> {pendingRewards ? formatEther(pendingRewards as bigint) : "0"} TOKEN</p>
            <p><strong>Penalización al unstake:</strong> {pendingRewards ? (parseFloat(formatEther(pendingRewards as bigint)) * 0.1).toFixed(4) : "0"} TOKEN</p>
          </div>

          <div style={{ marginTop: "2rem" }}>
            <input
              type="text"
              placeholder="Cantidad a stakear"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              style={{ padding: "0.5rem", width: "100%", marginBottom: "1rem" }}
            />
            <button onClick={() => stake?.()} disabled={!stake} style={{ width: "100%", padding: "0.75rem" }}>
              Stakear
            </button>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <button onClick={() => claimRewards?.()} disabled={!claimRewards} style={{ width: "100%", padding: "0.75rem" }}>
              Reclamar Recompensas
            </button>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <button onClick={() => unstake?.()} disabled={!unstake} style={{ width: "100%", padding: "0.75rem", backgroundColor: "#f87171" }}>
              Unstake (con penalización)
            </button>
          </div>
        </>
      )}
    </div>
  )
}