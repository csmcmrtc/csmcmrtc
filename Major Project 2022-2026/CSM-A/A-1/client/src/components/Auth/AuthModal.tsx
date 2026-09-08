import React, { useContext } from 'react';
import { AuthModalContext } from '../../App';
import Login from './Login';
import SignUp from './SignUp';

const AuthModal: React.FC = () => {
  const { openAuth, setOpenAuth, authOption, setAuthOption } = useContext(AuthModalContext);

  if (!openAuth) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        {authOption === 'login' && (
          <Login
            setOpenAuth={setOpenAuth}
            setAuthOption={setAuthOption}
          />
        )}
        {authOption === 'signup' && (
          <SignUp
            setOpenAuth={setOpenAuth}
            setAuthOption={setAuthOption}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
