import { Route, Routes } from "react-router-dom";
import "./App.css";
import Sender from "./pages/SenderPage/senderPage";
import TrackerPage from "./pages/TrakerPage/trackerPage";
import Template from "./pages/TemplatePage/templatePage";
import GeoTrackerPage from "./pages/GeoTrackPage/GeoTrackPage";
import ManualPage from "./pages/ManualPage/ManualPage";
import MainLayout from "./layouts/MainLayout";
import TextTrackPage from "./pages/TextTrackPage/TextTrackPage";
import DelTemplatePage from "./pages/DelTemplatePage/DelTemplatePage";
import { NotificationProvider } from "./utils/Notifications/Notifications";
import SchedulePage from "./pages/SchedulePage/SchedulePage";
import LogIn from "./pages/LogInPage/LogInPage";
import SignUp from "./pages/SignUpPage/SignUpPage";
import { useAuth } from "./hooks/useAuth";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchCurrentUser } from "./redux/auth/operations";
import UserHomepage from "./pages/UserHomepage/UserHomepage";
import Loader from "./utils/Loader/Loader";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import EditTemplate from "./pages/EditTemplate/EditTemplate";
import GroupSenderPage from "./pages/GroupSenderPage/GroupSenderPage";
import AddTemplate from "./components/AddTemplate/addTemplate";

function App() {
  const { isRefreshing, token } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  return isRefreshing ? (
    <Loader />
  ) : (
    <div className="App">
      <NotificationProvider>
        <Routes>
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Sender />} />
              <Route path="/trackpage" element={<TrackerPage />} />
              <Route path="/geoTrack" element={<GeoTrackerPage />} />
              <Route path="/textTrack" element={<TextTrackPage />} />
              <Route path="/addTemplate" element={<AddTemplate />} />
              <Route path="/manualSender" element={<ManualPage />} />
              <Route path="/groupSender" element={<GroupSenderPage />} />
              <Route path="/templates" element={<Template />} />
              <Route path="/schedulePage" element={<SchedulePage />} />
              <Route path="/userHomepage" element={<UserHomepage />} />
              <Route path="/editTemplate/:id" element={<EditTemplate />} />
            </Route>
          </Route>
        </Routes>
      </NotificationProvider>
    </div>
  );
}

export default App;
