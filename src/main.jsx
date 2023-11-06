import * as React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { ChakraProvider } from '@chakra-ui/react'
import * as ReactDOM from 'react-dom/client'
import App from './App'
import Home from './Home';
import Admin from './Admin';
import { GoogleOAuthProvider } from "@react-oauth/google";


const router = createBrowserRouter(
  createRoutesFromElements(

    <Route path='/' element={<App />} >
      <Route index element={<Home />} />
      <Route path='admin' element={<Admin />} />
      <Route path='*' element={<App />} />
    </Route>

    // <Routes>
    // <Route path='/' element={<App />}>
    //   <Route index element={<Home />} />
    //   <Route path='admin' element={<Admin />} />
    // </Route>

    // </Routes>
  )
);


const rootElement = document.getElementById('root')
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
      >
        <RouterProvider router={router} />
      </GoogleOAuthProvider>
    </ChakraProvider>
  </React.StrictMode>,
)