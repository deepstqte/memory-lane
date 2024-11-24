import "@fortawesome/fontawesome-free/css/all.min.css";
import MemoryList from "./MemoryList";
import './App.css'

function App() {
  return (
    <div>
      <div className='mx-auto max-w-7xl sm:px-6 lg:px-8 mt-32'>
        <div className='overflow-hidden rounded-lg bg-white shadow h-56'>
          <div className='px-4 py-5 sm:p-6'>
            <div className='flex items-center'>
              <h1 className='text-4xl font-semibold text-gray-900 mb-4 ml-4 mt-4'>
                Jae's memory lane
              </h1>
            </div>
            <p>
              Jae Doe's journey has been a tapestry of curiosity and exploration.
              From a young age, their inquisitive mind led them through diverse interests.
              Education shaped their multidisciplinary perspective,
              while personal experiences added depth and resilience to their story.
              Embracing challenges and cherishing relationships,
              Jae continues to craft a unique and inspiring life history.
            </p>
          </div>
        </div>
        <MemoryList/>
      </div>
      <footer className="footer">
      </footer>
    </div>
  )
}

export default App
