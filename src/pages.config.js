import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import MisconductList from './pages/MisconductList';
import BehaviorIncidents from './pages/BehaviorIncidents';
import PositiveBehavior from './pages/PositiveBehavior';
import Absences from './pages/Absences';
import Pledges from './pages/Pledges';
import Reports from './pages/Reports';
import StudentTracking from './pages/StudentTracking';
import StudentAffairs from './pages/StudentAffairs';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Students": Students,
    "MisconductList": MisconductList,
    "BehaviorIncidents": BehaviorIncidents,
    "PositiveBehavior": PositiveBehavior,
    "Absences": Absences,
    "Pledges": Pledges,
    "Reports": Reports,
    "StudentTracking": StudentTracking,
    "StudentAffairs": StudentAffairs,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};