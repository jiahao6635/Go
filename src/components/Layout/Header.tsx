import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useWeb3 } from '../../contexts/Web3Context'

const Header: React.FC = () => {
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet, balance } = useWeb3()
  const location = useLocation()

  const formatAddress = (address: string | null) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold text-gray-900">GO</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary-600' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              首页
            </Link>
            <Link
              to="/create"
              className={`text-sm font-medium transition-colors ${
                isActive('/create') 
                  ? 'text-primary-600' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              创建项目
            </Link>
            <Link
              to="/my-projects"
              className={`text-sm font-medium transition-colors ${
                isActive('/my-projects') 
                  ? 'text-primary-600' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              我的项目
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {formatAddress(account)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {parseFloat(balance).toFixed(4)} MON
                    </span>
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  断开
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn btn-primary"
              >
                {isConnecting ? '连接中...' : '连接钱包'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-4 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
          <Link
            to="/"
            className={`block px-3 py-2 text-base font-medium transition-colors ${
              isActive('/') 
                ? 'text-primary-600 bg-primary-50' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            首页
          </Link>
          <Link
            to="/create"
            className={`block px-3 py-2 text-base font-medium transition-colors ${
              isActive('/create') 
                ? 'text-primary-600 bg-primary-50' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            创建项目
          </Link>
          <Link
            to="/my-projects"
            className={`block px-3 py-2 text-base font-medium transition-colors ${
              isActive('/my-projects') 
                ? 'text-primary-600 bg-primary-50' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            我的项目
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
