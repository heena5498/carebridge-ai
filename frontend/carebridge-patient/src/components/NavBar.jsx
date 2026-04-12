import { useNavigate } from "react-router-dom";

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img src="/icon.png" alt="CareBridge" className="w-7 h-7 rounded object-cover" />
      <span className="font-semibold text-base" style={{ color: "#1B5E3B" }}>
        CareBridge
      </span>
    </div>
  );
}

export default function NavBar({ user }) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("carebridge_user");
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "MW";

  return (
    <nav
      className="sticky top-0 z-50 bg-white flex items-center justify-between px-5 py-3"
      style={{ borderBottom: "1px solid #E0D5C0" }}
    >
      <Logo />
      <div className="flex items-center gap-3">
        <span className="font-medium" style={{ fontSize: "13px", color: "#1E293B" }}>
          {user?.name || "Margaret Williams"}
        </span>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs"
          style={{ background: "#E8F0E4", color: "#1B5E3B" }}
        >
          {initials}
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs px-3 py-1.5 rounded-sm2 font-medium transition-colors"
          style={{ border: "0.5px solid #E0D5C0", color: "#5C4A2E", background: "transparent" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#FDF6EC")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
