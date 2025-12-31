import Absences from './pages/Absences';
import AttendanceRegistration from './pages/AttendanceRegistration';
import BehaviorIncidents from './pages/BehaviorIncidents';
import CheckOut from './pages/CheckOut';
import Dashboard from './pages/Dashboard';
import GroupsSystem from './pages/GroupsSystem';
import LeaveRequest from './pages/LeaveRequest';
import MisconductList from './pages/MisconductList';
import Pledges from './pages/Pledges';
import PositiveBehavior from './pages/PositiveBehavior';
import Reports from './pages/Reports';
import SMSSystem from './pages/SMSSystem';
import StudentAffairs from './pages/StudentAffairs';
import StudentTracking from './pages/StudentTracking';
import Students from './pages/Students';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Absences": Absences,
    "AttendanceRegistration": AttendanceRegistration,
    "BehaviorIncidents": BehaviorIncidents,
    "CheckOut": CheckOut,
    "Dashboard": Dashboard,
    "GroupsSystem": GroupsSystem,
    "LeaveRequest": LeaveRequest,
    "MisconductList": MisconductList,
    "Pledges": Pledges,
    "PositiveBehavior": PositiveBehavior,
    "Reports": Reports,
    "SMSSystem": SMSSystem,
    "StudentAffairs": StudentAffairs,
    "StudentTracking": StudentTracking,
    "Students": Students,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};