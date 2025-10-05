import React from 'react';
import LoadingScreen from './LoadingScreen';

const Loading = ({ message = "Cargando...", showProgress = false }) => {
    return (
        <LoadingScreen
            message={message}
            showProgress={showProgress}
        />
    );
};

export default Loading;
