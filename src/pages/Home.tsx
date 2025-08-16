import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useContract, Project } from '../hooks/useContract'
import { useWeb3 } from '../contexts/Web3Context'
import ContractStatus from '../components/ContractStatus'
import NetworkStatus from '../components/NetworkStatus'
import ProjectCard from '../components/ProjectCard'
import DemoMode from '../components/DemoMode'
import AnimatedCounter from '../components/AnimatedCounter'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatMON, formatTimeRemaining, calculateProgress } from '../utils/formatters'
import toast from 'react-hot-toast'

const Home: React.FC = () => {
  const { getActiveProjects, getProject, isLoading, contract } = useContract()
  const { isConnected, contractsInitialized } = useWeb3()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)
  
  // 合约地址
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const activeProjectIds = await getActiveProjects()
      if (activeProjectIds.length > 0) {
        const projectsData = await Promise.all(
          activeProjectIds.map(id => getProject(id))
        )
        setProjects(projectsData)
      } else {
        setProjects([])
      }
    } catch (error) {
      console.error('加载项目失败:', error)
      // 如果是合约未连接错误，不显示toast，因为已经有状态组件显示了
      if (!error.message?.includes('合约未连接')) {
        toast.error('加载项目失败')
      }
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const getProjectStatus = (project: Project) => {
    const now = Math.floor(Date.now() / 1000)
    if (project.isCompleted) {
      return { text: '已完成', color: 'success' }
    }
    if (now > project.deadline) {
      return { text: '已过期', color: 'danger' }
    }
    return { text: '进行中', color: 'primary' }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="large" text="正在加载精彩项目..." />
        </div>
      </div>
    )
  }

  // 如果是演示模式，显示演示界面
  if (demoMode) {
    return <DemoMode isActive={demoMode} onToggle={setDemoMode} />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Network Status */}
      <NetworkStatus />
      
      {/* Contract Status */}
      <ContractStatus 
        contractAddress={CONTRACT_ADDRESS} 
        isConnected={isConnected}
        contractsInitialized={contractsInitialized}
      />
      
      {/* Demo Mode Toggle */}
      <DemoMode isActive={demoMode} onToggle={setDemoMode} />
      
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          欢迎来到 GO 一元购平台
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          基于 Monad 区块链的去中心化众筹抽奖平台，用少量资金参与高价值商品抽奖
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/create" className="btn btn-primary">
            创建项目
          </Link>
          <a 
            href="#projects" 
            className="btn btn-secondary"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            浏览项目
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-all duration-300">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            <AnimatedCounter end={projects.length} />
          </div>
          <div className="text-gray-600 font-medium">活跃项目</div>
          <div className="text-xs text-gray-400 mt-1">等待您的参与</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-all duration-300">
          <div className="text-3xl font-bold text-success-600 mb-2">
            <AnimatedCounter end={projects.filter(p => p.isCompleted).length} />
          </div>
          <div className="text-gray-600 font-medium">已完成项目</div>
          <div className="text-xs text-gray-400 mt-1">成功送出奖品</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-all duration-300">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            <AnimatedCounter end={projects.reduce((sum, p) => sum + p.soldTickets, 0)} />
          </div>
          <div className="text-gray-600 font-medium">总参与人次</div>
          <div className="text-xs text-gray-400 mt-1">活跃的社区</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-all duration-300">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            <AnimatedCounter 
              end={Math.round(projects.reduce((sum, p) => sum + parseFloat(formatMON(p.currentAmount)), 0) * 100) / 100} 
              suffix=" MON"
            />
          </div>
          <div className="text-gray-600 font-medium">总筹款金额</div>
          <div className="text-xs text-gray-400 mt-1">平台活跃度</div>
        </div>
      </div>

      {/* Projects Grid */}
      <section id="projects">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">活跃项目</h2>
          <button 
            onClick={loadProjects}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            {isLoading ? '刷新中...' : '刷新'}
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-8 animate-bounce">
              <div className="mx-auto w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">暂无活跃项目</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              还没有项目？没关系！您可以尝试演示模式体验平台功能，或者成为第一个创建项目的用户！
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setDemoMode(true)}
                className="btn btn-secondary"
              >
                🎭 体验演示模式
              </button>
              <Link to="/create" className="btn btn-primary">
                🚀 创建第一个项目
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
