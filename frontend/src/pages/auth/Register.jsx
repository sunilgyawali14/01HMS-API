import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:9090/api/auth/register",
        form
      );
      console.log("Register success:", response.data);
      // Redirect to login page on success
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      const message =
        err?.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] flex items-center justify-center px-4">
      {/* Background Blur */}
      <div className="absolute top-0 left-0 w-500px h-500px bg-purple-700/30 rounded-full blur-3xl"></div>

      <div className="absolute bottom-0 right-0 w-500px h-500px bg-indigo-700/20 rounded-full blur-3xl"></div>

      {/* Register Card */}
      <div className="relative w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-white mt-6">Create Account</h1>

          <p className="text-slate-300 mt-3 text-sm">
            Fill in your details to get started
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center mb-5 animate-pulse">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Role */}
          <div className="relative">
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
            >
              <option value="" className="bg-slate-900">
                Select Role
              </option>

              <option value="admin" className="bg-slate-900">
                Admin
              </option>

              <option value="patient" className="bg-slate-900">
                Patient
              </option>

              <option value="doctor" className="bg-slate-900">
                Doctor
              </option>

              <option value="receptionist" className="bg-slate-900">
                Receptionist
              </option>
            </select>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-8">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Login In
          </Link>
        </p>
      </div>
    </div>
  );
}
