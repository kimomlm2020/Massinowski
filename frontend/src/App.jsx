import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ShopContextProvider from './context/ShopContext';
import Navbar from './components/Navbar';

// Pages existantes
import Home from './pages/Home';
import Programs from './pages/Programs';
import Login from './pages/Login';
import Cart from './pages/Cart';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Transformation from './pages/Transformation';
import Program from './pages/Program';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import Verify from './pages/Verify'; 
import Profile from './pages/Profile';

import "./style/App.scss";

// ⭐ COMPOSANT SCROLL TO TOP - Ajoutez ceci
const ScrollToTop = () => {
    const { pathname } = useLocation();
    
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth' // ou 'auto' pour instantané
        });
    }, [pathname]);
    
    return null;
};

const App = () => {
    return (
        <ShopContextProvider>
            <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
                <Navbar />
                
                <ToastContainer 
                    position="top-right"
                    autoClose={2000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />

                {/* ⭐ AJOUTEZ CECI : Le composant qui gère le scroll */}
                <ScrollToTop />

                <Routes>
                    {/* Routes existantes */}
                    <Route path='/' element={<Home />} />
                    <Route path='/programs' element={<Programs />} /> 
                    <Route path='/program/:programId' element={<Program />} />
                    <Route path='/cart' element={<Cart />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/place-order' element={<PlaceOrder />} />
                    <Route path='/orders' element={<Orders />} />
                    <Route path='/transformation' element={<Transformation />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-use" element={<TermsOfUse />} />
                    <Route path="/verify" element={<Verify />} />
                    <Route path="/profile" element={<Profile />} />

                </Routes>
            </div>
        </ShopContextProvider>
    )
}

export default App;