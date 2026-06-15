import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Tasks from '@/pages/Tasks'
import TaskCreate from '@/pages/TaskCreate'
import TaskDetail from '@/pages/TaskDetail'
import Sampling from '@/pages/Sampling'
import SamplingExecute from '@/pages/SamplingExecute'
import Review from '@/pages/Review'
import Results from '@/pages/Results'
import ResultDetail from '@/pages/ResultDetail'
import Testing from '@/pages/Testing'
import TestingExecute from '@/pages/TestingExecute'
import Disposal from '@/pages/Disposal'
import DisposalDetail from '@/pages/DisposalDetail'
import Plan from '@/pages/Plan'
import Equipment from '@/pages/Equipment'
import SpareParts from '@/pages/SpareParts'
import Statistics from '@/pages/Statistics'
import HeatMap from '@/pages/HeatMap'
import Report from '@/pages/Report'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/create" element={<TaskCreate />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/sampling" element={<Sampling />} />
          <Route path="/sampling/:id" element={<SamplingExecute />} />
          <Route path="/review" element={<Review />} />
          <Route path="/results" element={<Results />} />
          <Route path="/results/:id" element={<ResultDetail />} />
          <Route path="/testing" element={<Testing />} />
          <Route path="/testing/:id" element={<TestingExecute />} />
          <Route path="/disposal" element={<Disposal />} />
          <Route path="/disposal/:id" element={<DisposalDetail />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/equipment/spare-parts" element={<SpareParts />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/statistics/map" element={<HeatMap />} />
          <Route path="/statistics/report" element={<Report />} />
        </Route>
      </Routes>
    </Router>
  )
}
