import Absences from './pages/Absences';
import ApiDocs from './pages/ApiDocs';
import AttendanceRegistration from './pages/AttendanceRegistration';
import BehaviorIncidents from './pages/BehaviorIncidents';
import CheckOut from './pages/CheckOut';
import Dashboard from './pages/Dashboard';
import ExamsManagement from './pages/ExamsManagement';
import GroupsSystem from './pages/GroupsSystem';
import LeaveRequest from './pages/LeaveRequest';
import MisconductList from './pages/MisconductList';
import Pledges from './pages/Pledges';
import PositiveBehavior from './pages/PositiveBehavior';
import Reports from './pages/Reports';
import SMSSystem from './pages/SMSSystem';
import Settings from './pages/Settings';
import StudentGroupDistribution from './pages/StudentGroupDistribution';
import StudentTracking from './pages/StudentTracking';
import Students from './pages/Students';
import UsersManagement from './pages/UsersManagement';
import ImportStudentData from './pages/ImportStudentData';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Absences": Absences,
    "ApiDocs": ApiDocs,
    "AttendanceRegistration": AttendanceRegistration,
    "BehaviorIncidents": BehaviorIncidents,
    "CheckOut": CheckOut,
    "Dashboard": Dashboard,
    "ExamsManagement": ExamsManagement,
    "GroupsSystem": GroupsSystem,
    "LeaveRequest": LeaveRequest,
    "MisconductList": MisconductList,
    "Pledges": Pledges,
    "PositiveBehavior": PositiveBehavior,
    "Reports": Reports,
    "SMSSystem": SMSSystem,
    "Settings": Settings,
    "StudentGroupDistribution": StudentGroupDistribution,
    "StudentTracking": StudentTracking,
    "Students": Students,
    "UsersManagement": UsersManagement,
    "ImportStudentData": ImportStudentData,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};