import React from "react";
import Navbar from "../component/Nav";
import Footer from "../component/Footer";

function About() {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image:
        "https://media.istockphoto.com/id/1185367863/photo/smiling-business-woman-portrait.jpg?s=612x612&w=0&k=20&c=i19PDtTroZB0r1K1MmWARhdfQ4NHoTYB7SDyDn8W09I=",
      bio: "With over 10 years in e-commerce, Sarah leads our vision for exceptional customer experiences.",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image:
        "https://t4.ftcdn.net/jpg/05/31/37/89/360_F_531378938_xwRjN9e5ramdPj2coDwHrwk9QHckVa5Y.jpg",
      bio: "Technology enthusiast driving our platform's innovation and performance excellence.",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Marketing",
      image:
        "https://i.pinimg.com/736x/99/8f/41/998f41fc4c63e69c06b99a6e03629815.jpg",
      bio: "Creative strategist connecting brands with customers through compelling storytelling.",
    },
  ];

  const stats = [
    { number: "500K+", label: "Happy Customers" },
    { number: "50K+", label: "Products Available" },
    { number: "100+", label: "Countries Served" },
    { number: "99.9%", label: "Uptime Guarantee" },
  ];

  const values = [
    {
      icon: "🎯",
      title: "Customer First",
      description:
        "Every decision we make is centered around delivering exceptional value and experience.",
    },
    {
      icon: "🔒",
      title: "Trust & Security",
      description:
        "We prioritize the security of your data and maintain enterprise-grade protections.",
    },
    {
      icon: "🚀",
      title: "Innovation",
      description:
        "We continuously evolve using cutting-edge technology and user-centric design.",
    },
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen w-full bg-gradient-to-l from-[#141414] to-[#0c2025] text-white pt-20">

        {/* ================= HERO ================= */}
        <section className="text-center py-12 flex flex-col items-center px-6">
          <h1 className="text-4xl font-bold">
            ABOUT <span className="text-[#46d1f7]">ONE<span className="px-1">CART</span></span>
          </h1>
          <div className="mt-2 h-[3px] w-[90px] bg-[#46d1f7]"></div>

          <p className="max-w-3xl mt-5 text-gray-300 text-lg">
            Transforming how people shop online using innovation,
            trust and a world-class customer experience.
          </p>
        </section>

        {/* ================= STORY ================= */}
        <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-3xl font-bold">
                Our <span className="text-[#46d1f7]">Story</span>
              </h2>
              <div className="h-[3px] w-[50px] bg-[#46d1f7]"></div>
            </div>

            <p className="text-gray-300 leading-relaxed mb-4">
              Founded in 2020, OneCart began with one mission — making online
              shopping easier, faster and enjoyable for every user.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              What started as a 3-member startup is now a global e-commerce
              platform serving customers in 100+ countries.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Today we proudly offer 50,000+ products delivered with speed,
              trust and complete transparency.
            </p>
          </div>

          <img
            className="rounded-xl shadow-xl border border-[#9ff9f9]/20"
            src="https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg"
            alt="Story"
          />
        </section>

        {/* ================= STATS ================= */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-6">
            {stats.map((s, i) => (
              <div
                key={i}
                className="text-center bg-white/10 backdrop-blur-md border border-[#46d1f7]/30 p-6 rounded-xl shadow-lg"
              >
                <h3 className="text-3xl font-bold text-[#9ff9f9]">
                  {s.number}
                </h3>
                <p className="text-gray-300 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= VALUES ================= */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="text-center text-3xl font-bold">
            Our <span className="text-[#46d1f7]">Values</span>
          </h2>
          <div className="mt-2 h-[3px] w-[90px] bg-[#46d1f7] mx-auto mb-14"></div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <div
                key={i}
                className="p-8 bg-white/10 backdrop-blur-lg rounded-xl border border-[#46d1f7]/30 shadow-xl"
              >
                <div className="text-5xl mb-5">{v.icon}</div>
                <h3 className="text-xl font-semibold text-[#9ff9f9]">
                  {v.title}
                </h3>
                <p className="text-gray-300 mt-2 leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= TEAM ================= */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center">
            Meet Our <span className="text-[#46d1f7]">Team</span>
          </h2>
          <div className="mt-2 h-[3px] w-[90px] bg-[#46d1f7] mx-auto mb-14"></div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {teamMembers.map((m, i) => (
              <div
                key={i}
                className="rounded-xl bg-white/10 backdrop-blur-lg p-6 border border-[#46d1f7]/30 shadow-xl hover:-translate-y-1 transition"
              >
                <img
                  src={m.image}
                  className="rounded-xl h-64 w-full object-cover mb-4 border border-[#46d1f7]/20"
                  alt={m.name}
                />
                <h3 className="text-xl font-semibold text-[#9ff9f9]">
                  {m.name}
                </h3>
                <p className="text-sm text-gray-400">{m.role}</p>
                <p className="text-gray-300 text-sm mt-3">{m.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= MISSION ================= */}
        <section className="py-20 px-6">
          <h2 className="text-3xl font-bold text-center">
            Our <span className="text-[#46d1f7]">Mission</span>
          </h2>
          <div className="mt-2 h-[3px] w-[90px] bg-[#46d1f7] mx-auto mb-10"></div>

          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-300 leading-relaxed mb-8">
              To democratize commerce and build a platform where both
              customers and sellers grow through innovation, trust & transparency.
            </p>

            <div className="grid md:grid-cols-2 gap-6 text-left mt-10">
              {[
                ["🎯", "Empowering Sellers", "Enable businesses to reach global customers"],
                ["❤️", "Delighting Users", "Every interaction is built for joy & convenience"],
                ["🌍", "Worldwide Reach", "Serving customers across 100+ countries"],
                ["🎨", "Personalized Shopping", "AI powered recommendations tailored for you"],
              ].map(([icon, title, desc], i) => (
                <div key={i} className="flex gap-4">
                  <div className="text-4xl">{icon}</div>
                  <div>
                    <h4 className="font-semibold text-[#9ff9f9]">{title}</h4>
                    <p className="text-gray-400 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </>
  );
}

export default About;
