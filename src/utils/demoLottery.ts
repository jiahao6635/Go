// 演示模式的抽奖逻辑
export const simulateDrawLottery = (participants: any[], maxTickets: number) => {
  if (!participants || participants.length === 0) {
    return null
  }

  // 创建抽奖券池
  const ticketPool: string[] = []
  participants.forEach(participant => {
    for (let i = 0; i < participant.ticketCount; i++) {
      ticketPool.push(participant.address)
    }
  })

  if (ticketPool.length === 0) {
    return null
  }

  // 生成伪随机数选择获奖者
  const randomIndex = Math.floor(Math.random() * ticketPool.length)
  const winnerAddress = ticketPool[randomIndex]

  // 找到获奖者的详细信息
  const winner = participants.find(p => p.address === winnerAddress)

  return {
    winner: winnerAddress,
    winnerInfo: winner,
    totalTickets: ticketPool.length,
    winningTicketIndex: randomIndex
  }
}

// 生成演示参与者数据
export const generateDemoParticipants = (soldTickets: number, maxTickets: number) => {
  const participants = []
  const addresses = [
    '0x742d35Cc6DbE78B94165a6Fe169a4c072C1d9A17',
    '0x8ba1f109551bD432803012645Hac136c7b22c712',
    '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4CE',
    '0xB64ef51C888972c908CFacf59B47C1AfBC0Ab8aC',
    '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
  ]

  let remainingTickets = soldTickets
  let participantIndex = 0

  while (remainingTickets > 0 && participantIndex < addresses.length) {
    const maxTicketsForUser = Math.min(remainingTickets, Math.floor(Math.random() * 10) + 1)
    const ticketCount = Math.floor(Math.random() * maxTicketsForUser) + 1
    
    participants.push({
      address: addresses[participantIndex],
      ticketCount,
      amount: ticketCount * 0.1, // 假设每张券0.1 MON
      timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 // 最近7天内
    })

    remainingTickets -= ticketCount
    participantIndex++
  }

  return participants
}
