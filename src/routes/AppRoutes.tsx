import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoanPortal from "../pages/LoanPortal";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoanPortal />} />
        <Route path="/login" element={<LoanPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
