import { ethers } from 'ethers'

/**
 * 格式化以太币金额为MON显示
 * @param value - 以wei为单位的bigint值
 * @param decimals - 小数位数，默认4位
 * @returns 格式化后的字符串
 */
export const formatMON = (value: bigint, decimals: number = 4): string => {
  return parseFloat(ethers.formatEther(value)).toFixed(decimals)
}

/**
 * 格式化以太币金额为MON显示（自动调整小数位数）
 * @param value - 以wei为单位的bigint值
 * @returns 格式化后的字符串
 */
export const formatMONSmart = (value: bigint): string => {
  const formatted = parseFloat(ethers.formatEther(value))
  if (formatted === 0) return '0'
  if (formatted < 0.0001) return formatted.toExponential(2)
  if (formatted < 1) return formatted.toFixed(6)
  if (formatted < 10) return formatted.toFixed(4)
  if (formatted < 1000) return formatted.toFixed(2)
  return formatted.toLocaleString()
}

/**
 * 解析MON金额为wei
 * @param value - MON金额字符串
 * @returns wei单位的bigint
 */
export const parseMON = (value: string): bigint => {
  return ethers.parseEther(value)
}

/**
 * 格式化地址显示
 * @param address - 完整地址
 * @returns 缩略地址
 */
export const formatAddress = (address: string | null): string => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * 格式化时间剩余
 * @param deadline - 截止时间戳（秒）
 * @returns 格式化的时间字符串
 */
export const formatTimeRemaining = (deadline: number): string => {
  const now = Math.floor(Date.now() / 1000)
  const remaining = deadline - now
  
  if (remaining <= 0) return '已结束'
  
  const days = Math.floor(remaining / 86400)
  const hours = Math.floor((remaining % 86400) / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  
  if (days > 0) return `${days}天 ${hours}小时`
  if (hours > 0) return `${hours}小时 ${minutes}分钟`
  return `${minutes}分钟`
}

/**
 * 计算进度百分比
 * @param current - 当前金额
 * @param total - 目标金额
 * @returns 百分比数值
 */
export const calculateProgress = (current: bigint, total: bigint): number => {
  if (total === 0n) return 0
  return Number(current * 100n / total)
}
