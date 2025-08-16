import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Web3Provider } from './contexts/Web3Context'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import CreateProject from './pages/CreateProject'
import MyProjects from './pages/MyProjects'

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/create" element={<CreateProject />} />
              <Route path="/my-projects" element={<MyProjects />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Web3Provider>
  )
}

export default App
