import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FallDetection from './components/FallDetection'
import ActivityMonitor from './components/ActivityMonitor'
import SocialPrescription from './components/SocialPrescription'
import PostAGI from './components/PostAGI'

export default function App() {
  return (
    <div className="font-sans antialiased bg-white text-gray-900">
      <Navbar />
      <Hero />
      <FallDetection />
      <ActivityMonitor />
      <SocialPrescription />
      <PostAGI />
    </div>
  )
}
