
import { Heart, ShieldCheck, Clock, ArrowRight } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-[#F7FAF9]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="bg-teal-600 p-2 rounded-xl">
            <Heart className="text-white" size={22} />
          </div>
          <span className="text-xl font-bold text-gray-800">
            TheCarePal
          </span>
        </div>

        <a
          href="#services"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Our Services
        </a>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">

          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 mb-7">
            <ShieldCheck size={16} />
            Trusted Home Healthcare
          </span>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
            Quality care at home,
            <span className="text-teal-600"> made simple.</span>
          </h1>

          <p className="mt-6 text-gray-500 text-base md:text-lg leading-relaxed">
            Find the right care for your loved ones.
            Build a personalized care plan and get
            an instant price estimate.
          </p>

          <button className="mt-9 inline-flex items-center gap-3 rounded-xl bg-teal-600 px-7 py-4 font-semibold text-white shadow-lg shadow-teal-100 hover:bg-teal-700 transition">
            Build Your Care Plan
            <ArrowRight size={19} />
          </button>

          <div className="mt-14 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-teal-600" />
              Trained Caregivers
            </span>

            <span className="flex items-center gap-2">
              <Clock size={18} className="text-teal-600" />
              Flexible Care Plans
            </span>
          </div>
        </div>

        {/* Services */}
        <div id="services" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-24">

          {[
            {
              title: "Elderly Care",
              description: "Personalized assistance for senior citizens."
            },
            {
              title: "Dementia Care",
              description: "Specialized support for Alzheimer's and dementia."
            },
            {
              title: "Baby Care",
              description: "Reliable care and assistance for newborns."
            },
            {
              title: "Recovery Care",
              description: "Support during post-surgery recovery."
            }
          ].map((service) => (
            <div
              key={service.title}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center mb-5">
                <Heart className="text-teal-600" size={21} />
              </div>

              <h3 className="font-bold text-gray-800">
                {service.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white py-6 text-center text-sm text-gray-400">
        © 2026 TheCarePal. Home healthcare made simpler.
      </footer>
    </div>
  );
}

export default App;
