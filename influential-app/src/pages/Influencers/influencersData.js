// src/pages/Influencers/influencersData.js
import photo1 from '../../assets/influencer1.svg';
import photo2 from '../../assets/influencer2.svg';
import photo3 from '../../assets/influencer3.svg';
import photo4 from '../../assets/influencer4.svg';
import photo5 from '../../assets/influencer5.svg';
import photo6 from '../../assets/influencer6.svg';

const influencers = [
  {
    id: 1,
    photo: photo1,
    handle: 'santoslopez',
    location: 'Buenos Aires, Arg',
    rating: 5,
    description: 'Amante de los autos con pasión por la velocidad y estilo.',
    instagram: '22K',
    tiktok: '22K',
    followersNum: 22000,
    engagementNum: 7.2,
    categories: ['Autos', 'Lifestyle', 'Deportes'],
  },
  {
    id: 2,
    photo: photo2,
    handle: 'maria_gomez',
    location: 'Madrid, España',
    rating: 4,
    description: 'Experta en moda y belleza, compartiendo tendencias cada día.',
    instagram: '18K',
    tiktok: '20K',
    followersNum: 18000,
    engagementNum: 5.4,
    categories: ['Belleza', 'Moda'],
  },
  {
    id: 3,
    photo: photo3,
    handle: 'tech_guru',
    location: 'San Francisco, USA',
    rating: 5,
    description: 'Apasionado por la tecnología y gadgets de última generación.',
    instagram: '30K',
    tiktok: '25K',
    followersNum: 30000,
    engagementNum: 8.1,
    categories: ['Tech', 'Gaming'],
  },
  {
    id: 4,
    photo: photo4,
    handle: 'fitness_feel',
    location: 'Rio de Janeiro, Brasil',
    rating: 4,
    description: 'Coach de fitness compartiendo rutinas y tips saludables.',
    instagram: '15K',
    tiktok: '17K',
    followersNum: 15000,
    engagementNum: 6.3,
    categories: ['Fitness', 'Salud'],
  },
  {
    id: 5,
    photo: photo5,
    handle: 'travelwithana',
    location: 'Ciudad de México, MEX',
    rating: 5,
    description: 'Viajes y aventuras por el mundo con consejos prácticos.',
    instagram: '40K',
    tiktok: '35K',
    followersNum: 40000,
    engagementNum: 9.5,
    categories: ['Viajes', 'Aventura'],
  },
  {
    id: 6,
    photo: photo6,
    handle: 'foodie_fabian',
    location: 'Buenos Aires, Arg',
    rating: 4,
    description: 'Explorando sabores y recetas innovadoras cada semana.',
    instagram: '28K',
    tiktok: '30K',
    followersNum: 28000,
    engagementNum: 4.8,
    categories: ['Gastronomía', 'Lifestyle'],
  },
];

export default influencers;
