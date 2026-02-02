import CaseDetail from './pages/CaseDetail';
import Cases from './pages/Cases';
import Dashboard from './pages/Dashboard';
import EditCase from './pages/EditCase';
import NewCase from './pages/NewCase';
import Templates from './pages/Templates';
import CaseAnalysis from './pages/CaseAnalysis.jsx';
import __Layout from './Layout.js';


export const PAGES = {
    "CaseDetail": CaseDetail,
    "Cases": Cases,
    "Dashboard": Dashboard,
    "EditCase": EditCase,
    "NewCase": NewCase,
    "Templates": Templates,
    "CaseAnalysis": CaseAnalysis,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};