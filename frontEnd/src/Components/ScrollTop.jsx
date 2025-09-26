import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop({ topWhenHome, topWhenAbout, topWhenContact }) {
    const { pathname } = useLocation();

    useEffect(() => {
        if (pathname === "/") {
            window.scrollTo({ top: topWhenHome, behavior: "smooth" });
        } 
        else if(pathname === "/about"){
            window.scrollTo({ top:topWhenAbout, behavior:"smooth"})
        }

        else if(pathname === "/contact"){
            window.scrollTo({ top: topWhenContact, behavior: "smooth" });
        }
        else{
           
        }

    }, [pathname, topWhenHome, topWhenAbout, topWhenContact]);

    return null;
}

export default ScrollToTop;
