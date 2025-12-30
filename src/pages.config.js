import Absences from './pages/Absences';
import BehaviorIncidents from './pages/BehaviorIncidents';
import Dashboard from './pages/Dashboard';
import MisconductList from './pages/MisconductList';
import Pledges from './pages/Pledges';
import PositiveBehavior from './pages/PositiveBehavior';
import Reports from './pages/Reports';
import StudentAffairs from './pages/StudentAffairs';
import StudentTracking from './pages/StudentTracking';
import Students from './pages/Students';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Absences": Absences,
    "BehaviorIncidents": BehaviorIncidents,
    "Dashboard": Dashboard,
    "MisconductList": MisconductList,
    "Pledges": Pledges,
    "PositiveBehavior": PositiveBehavior,
    "Reports": Reports,
    "StudentAffairs": StudentAffairs,
    "StudentTracking": StudentTracking,
    "Students": Students,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};