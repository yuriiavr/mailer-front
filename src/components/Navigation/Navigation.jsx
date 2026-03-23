import { BrowserRouter as Router, Routes, Route, useLocation, Link } from "react-router-dom";
import css from './Navigation.module.css'
import Container from "../Container/Container";

const Navigation = () => {
    const location = useLocation();
  
    return (
      <Container>
        <div className={css.navCont}>
          <Link
            className={css.page}
            to="/trackpage"
            style={{
              color: location.pathname === "/trackpage" ? "#fc621a" : "grey"
            }}
          >
            All stats
          </Link>
            <span className={css.slash}>/</span>
          <Link
            to="/geoTrack"
            className={css.page}
            style={{
              color: location.pathname === "/geoTrack" ? "#fc621a" : "grey",
            }}
          >
           Geo stats
          </Link>
          <span className={css.slash}>/</span>
          <Link
            to="/textTrack"
            className={css.page}
            style={{
              color: location.pathname === "/textTrack" ? "#fc621a" : "grey",
            }}
          >
           Text stat
          </Link>
        </div>
      </Container>
    );
  };

  export default Navigation;