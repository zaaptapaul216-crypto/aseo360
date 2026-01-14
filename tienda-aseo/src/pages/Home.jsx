import React from 'react';
import Hero from '../componentes/Hero';
import Categories from '../componentes/Categorias';
import PartnersBanner from '../componentes/PartnersBanner';

const Home = () => {
    return (
        <>
            <Hero />
            <Categories />
            <PartnersBanner />
        </>
    );
};

export default Home;
