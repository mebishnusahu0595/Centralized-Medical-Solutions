import { 
  Database, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Bell, 
  BarChart3,
  AlertTriangle,
  History,
  ShieldCheck
} from "lucide-react";

const painPoints = [
  {
    title: "Equipment breakdowns caught too late",
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-50"
  },
  {
    title: "Maintenance history lost in paper registers",
    icon: History,
    color: "text-amber-500",
    bg: "bg-amber-50"
  },
  {
    title: "No compliance visibility before audits",
    icon: ShieldCheck,
    color: "text-blue-500",
    bg: "bg-blue-50"
  }
];

const mainFeatures = [
  {
    title: "Equipment Registry",
    description: "Centralize every device with full history, location tracking, and digital documentation.",
    icon: Database
  },
  {
    title: "Maintenance Scheduling",
    description: "Never miss a PM with smart alerts and automated recurrence based on manufacturer guidelines.",
    icon: Calendar
  },
  {
    title: "Digital Service Reports",
    description: "Engineers submit reports directly from their mobile devices, including photos and signatures.",
    icon: FileText
  },
  {
    title: "Compliance Tracking",
    description: "Stay audit-ready with real-time dashboards for NABH/NABL compliance certifications.",
    icon: CheckCircle
  },
  {
    title: "Real-Time Notifications",
    description: "Breakdowns and issues are alerted to the right team members the moment they happen.",
    icon: Bell
  },
  {
    title: "Analytics Dashboard",
    description: "Visualize equipment performance, lifecycle costs, and team efficiency at a glance.",
    icon: BarChart3
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Pain Points Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-medical-navy mb-4">Old Systems Are Costing You Lives.</h2>
            <p className="text-slate-600">Traditional equipment management is broken. We fixed it.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {painPoints.map((point, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div className={`${point.bg} ${point.color} w-16 h-16 rounded-full flex items-center justify-center mb-6`}>
                  <point.icon size={32} />
                </div>
                <p className="text-lg font-bold text-medical-navy leading-snug">{point.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-medical-navy mb-4">Everything you need to run a modern facility.</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">One integrated platform to manage your entire biomedical inventory across multiple locations.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-medical-blue/30 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-medical-navy flex items-center justify-center mb-6 group-hover:bg-medical-blue group-hover:text-white transition-colors">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-medical-navy mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
