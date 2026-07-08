"use client";

import { useState } from "react";
import { useFleetStore } from "@/lib/store/fleetStore";
import { useSharedFleetData } from "@/components/FleetDataProvider";
import { Bus, ShieldAlert, User, ChevronRight } from "lucide-react";

export function LoginView() {
  // NOTE: This is a temporary UI-only mock auth flow for demo/navigation parity with pleum.
  // Real authentication will be handled by Better Auth later.
  // Do NOT connect this to the real auth database.
  const { drivers } = useSharedFleetData();
  const { loginDispatcher, loginDriver } = useFleetStore();
  const [selectedRole, setSelectedRole] = useState<"none" | "dispatcher" | "driver">("none");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  const handleDriverLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDriverId) {
      loginDriver(Number(selectedDriverId));
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-green-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] rounded-[2rem] mx-4 overflow-hidden">
        {/* Subtle inner highlight */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        <div className="relative z-20 flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.5)] mb-6 ring-1 ring-white/20">
            <Bus className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Fleet Dashboard</h1>
          <p className="text-blue-200/80 text-sm mt-2 font-medium">System Access Portal</p>
        </div>

        {selectedRole === "none" && (
          <div className="space-y-4 relative z-20">
            <button
              onClick={() => loginDispatcher()}
              className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300 group"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 ring-1 ring-blue-500/30">
                  <ShieldAlert className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white text-lg">Dispatcher</p>
                  <p className="text-xs text-blue-200/70">นายท่า / ผู้ดูแลระบบ</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-blue-400 transition-colors transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => setSelectedRole("driver")}
              className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-green-400/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all duration-300 group"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-all duration-300 ring-1 ring-green-500/30">
                  <User className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white text-lg">Driver</p>
                  <p className="text-xs text-green-200/70">คนขับรถ</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-green-400 transition-colors transform group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {selectedRole === "driver" && (
          <form
            onSubmit={handleDriverLogin}
            className="space-y-6 relative z-20 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div>
              <label className="block text-sm font-medium text-blue-200/90 mb-3">
                Select Driver Account
              </label>
              <div className="relative">
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full p-4 bg-gray-900/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all shadow-inner text-white appearance-none"
                  required
                >
                  <option value="" disabled className="bg-gray-800 text-gray-400">
                    Select your name...
                  </option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id} className="bg-gray-800 text-white">
                      {d.code} - {d.name} {d.surname} ({d.route})
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRole("none")}
                className="flex-1 px-4 py-4 text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-medium transition-all duration-300"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-4 text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-2xl font-medium transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transform hover:-translate-y-0.5"
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
