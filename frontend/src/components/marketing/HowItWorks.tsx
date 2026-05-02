const steps = [
  {
    number: "01",
    title: "Onboard Your Hospital",
    description: "Our team sets up your account and hospital profile in less than 30 minutes. No complex configuration required."
  },
  {
    number: "02",
    title: "Import Your Inventory",
    description: "Add equipment manually or use our smart Excel import tool to bring your entire registry live instantly."
  },
  {
    number: "03",
    title: "Assign & Schedule",
    description: "Set up engineers and maintenance frequencies. The system automatically handles the rest of the calendar."
  },
  {
    number: "04",
    title: "Automate & Optimize",
    description: "Get real-time updates, instant reports, and predictive alerts. Focus on patient care while we handle the tech."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-medical-navy text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-medical-blue/5 blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4">Go Live in Minutes, Not Months.</h2>
          <p className="text-slate-400 max-w-xl mx-auto">We've simplified hospital equipment management so you can start seeing results from day one.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 left-10 right-10 h-0.5 bg-slate-800 -z-10"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-8 group-hover:border-medical-blue group-hover:text-medical-blue transition-all">
                <span className="text-3xl font-heading font-bold">{step.number}</span>
              </div>
              <h3 className="text-xl font-bold mb-4">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-24 p-8 rounded-3xl bg-gradient-to-r from-medical-blue to-blue-600 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-lg text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">Ready to modernize your facility?</h3>
            <p className="text-white/80">Join 100+ hospitals that have already digitized their operations.</p>
          </div>
          <button className="bg-white text-medical-navy font-bold px-10 py-4 rounded-full hover:bg-slate-100 transition-all whitespace-nowrap">
            Schedule a Demo Now
          </button>
        </div>
      </div>
    </section>
  );
}
