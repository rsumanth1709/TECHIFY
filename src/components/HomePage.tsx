import { useState, useEffect, useRef } from "react";
import { Home, User, Calendar, MapPin, ExternalLink, Search, Share2, Navigation, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ProfileView } from "./ProfileView";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";

interface Hackathon {
  id: number;
  title: string;
  organizer: string;
  location: string;
  date: string;
  prize: string;
  image: string;
  status: "ongoing" | "upcoming";
  registrationLink: string;
  streams: string[];
  region: "India" | "International";
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
}

export function HomePage() {
  const [currentView, setCurrentView] = useState<"home" | "profile">("home");
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [isStreamDialogOpen, setIsStreamDialogOpen] = useState(false);
  const [isNearbyDialogOpen, setIsNearbyDialogOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [showNearbyEvents, setShowNearbyEvents] = useState(false);

  const streams = [
    "Computer Science and Engineering (CSE)",
    "Artificial Intelligence and Data Science (AIDS)",
    "Artificial Intelligence and Machine Learning (AIML)",
    "Computer Science (CS)",
    "Information Technology (IT)",
    "Electronics and Communication Engineering (ECE)",
    "Electrical Engineering (EE)",
    "Mechanical Engineering (ME)",
    "Civil Engineering (CE)",
    "Chemical Engineering",
    "Biotechnology",
    "All Streams"
  ];

  const allHackathons: Hackathon[] = [
    // CSE/CS/IT focused hackathons - India
    {
      id: 1,
      title: "Smart India Hackathon 2024",
      organizer: "Government of India",
      location: "Multiple Cities, India",
      date: "Dec 15-16, 2024",
      prize: "₹1,00,000",
      image: "https://images.unsplash.com/photo-1565687981296-535f09db714e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWNrYXRob24lMjBjb2RpbmclMjBldmVudHxlbnwxfHx8fDE3NjEzOTQ4Njd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "ongoing",
      registrationLink: "#",
      streams: ["Computer Science and Engineering (CSE)", "Computer Science (CS)", "Information Technology (IT)", "All Streams"],
      region: "India",
      coordinates: { lat: 28.6139, lng: 77.2090 } // Delhi
    },
    {
      id: 2,
      title: "HackBengaluru",
      organizer: "Tech Community Bangalore",
      location: "Bangalore, Karnataka",
      date: "Dec 20-21, 2024",
      prize: "₹75,000",
      image: "https://images.unsplash.com/photo-1555725305-0406b7607be0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwY29uZmVyZW5jZSUyMGluZGlhfGVufDF8fHx8MTc2MTQwMjEzNHww&ixlib=rb-4.1.0&q=80&w=1080",
      status: "ongoing",
      registrationLink: "#",
      streams: ["Computer Science and Engineering (CSE)", "Computer Science (CS)", "Information Technology (IT)", "All Streams"],
      region: "India",
      coordinates: { lat: 12.9716, lng: 77.5946 } // Bangalore
    },
    // AI/ML focused hackathons - India
    {
      id: 3,
      title: "AI Innovation Challenge",
      organizer: "IIT Delhi",
      location: "Delhi NCR",
      date: "Jan 5-7, 2025",
      prize: "₹2,00,000",
      image: "https://images.unsplash.com/photo-1732210038512-bf24e8d750e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXJzJTIwY29kaW5nJTIwdGVhbXxlbnwxfHx8fDE3NjE0MDIxMzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "ongoing",
      registrationLink: "#",
      streams: ["Artificial Intelligence and Data Science (AIDS)", "Artificial Intelligence and Machine Learning (AIML)", "Computer Science and Engineering (CSE)", "All Streams"],
      region: "India",
      coordinates: { lat: 28.5450, lng: 77.1920 } // IIT Delhi
    },
    {
      id: 4,
      title: "DataHack India 2025",
      organizer: "Analytics Vidhya",
      location: "Hyderabad, Telangana",
      date: "Jan 18-19, 2025",
      prize: "₹1,25,000",
      image: "https://images.unsplash.com/photo-1733826544831-ad71d05c8423?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwY29tcGV0aXRpb258ZW58MXx8fHwxNzYxNDAyMTM0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "ongoing",
      registrationLink: "#",
      streams: ["Artificial Intelligence and Data Science (AIDS)", "Artificial Intelligence and Machine Learning (AIML)", "All Streams"],
      region: "India",
      coordinates: { lat: 17.3850, lng: 78.4867 } // Hyderabad
    },
    // ECE focused hackathons - India
    {
      id: 5,
      title: "IoT Innovation Hackathon",
      organizer: "NIT Trichy",
      location: "Tiruchirappalli, Tamil Nadu",
      date: "Jan 25-26, 2025",
      prize: "₹80,000",
      image: "https://images.unsplash.com/photo-1565687981296-535f09db714e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWNrYXRob24lMjBjb2RpbmclMjBldmVudHxlbnwxfHx8fDE3NjEzOTQ4Njd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "ongoing",
      registrationLink: "#",
      streams: ["Electronics and Communication Engineering (ECE)", "Electrical Engineering (EE)", "Computer Science and Engineering (CSE)", "All Streams"],
      region: "India",
      coordinates: { lat: 10.7905, lng: 78.7047 } // Trichy
    },
    // International hackathons - CSE/IT
    {
      id: 6,
      title: "Global Developers Summit",
      organizer: "Tech Giants Consortium",
      location: "San Francisco, USA",
      date: "Feb 5-7, 2025",
      prize: "$25,000",
      image: "https://images.unsplash.com/photo-1555725305-0406b7607be0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwY29uZmVyZW5jZSUyMGluZGlhfGVufDF8fHx8MTc2MTQwMjEzNHww&ixlib=rb-4.1.0&q=80&w=1080",
      status: "ongoing",
      registrationLink: "#",
      streams: ["Computer Science and Engineering (CSE)", "Computer Science (CS)", "Information Technology (IT)", "All Streams"],
      region: "International",
      coordinates: { lat: 37.7749, lng: -122.4194 } // San Francisco
    },
    {
      id: 7,
      title: "European AI Challenge",
      organizer: "EU Tech Forum",
      location: "Berlin, Germany",
      date: "Feb 12-14, 2025",
      prize: "€30,000",
      image: "https://images.unsplash.com/photo-1732210038512-bf24e8d750e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXJzJTIwY29kaW5nJTIwdGVhbXxlbnwxfHx8fDE3NjE0MDIxMzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "ongoing",
      registrationLink: "#",
      streams: ["Artificial Intelligence and Data Science (AIDS)", "Artificial Intelligence and Machine Learning (AIML)", "Computer Science and Engineering (CSE)", "All Streams"],
      region: "International",
      coordinates: { lat: 52.5200, lng: 13.4050 } // Berlin
    },
    // Mechanical/Civil focused - India
    {
      id: 8,
      title: "Smart Infrastructure Hackathon",
      organizer: "IIT Bombay",
      location: "Mumbai, Maharashtra",
      date: "Feb 20-21, 2025",
      prize: "₹90,000",
      image: "https://images.unsplash.com/photo-1733826544831-ad71d05c8423?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwY29tcGV0aXRpb258ZW58MXx8fHwxNzYxNDAyMTM0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "ongoing",
      registrationLink: "#",
      streams: ["Civil Engineering (CE)", "Mechanical Engineering (ME)", "All Streams"],
      region: "India",
      coordinates: { lat: 19.0760, lng: 72.8777 } // Mumbai
    },
    // All Streams hackathons - India
    {
      id: 9,
      title: "Innovate India Mega Hackathon",
      organizer: "NITI Aayog",
      location: "New Delhi, India",
      date: "Mar 1-3, 2025",
      prize: "₹5,00,000",
      image: "https://images.unsplash.com/photo-1565687981296-535f09db714e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWNrYXRob24lMjBjb2RpbmclMjBldmVudHxlbnwxfHx8fDE3NjEzOTQ4Njd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "ongoing",
      registrationLink: "#",
      streams: ["All Streams"],
      region: "India",
      coordinates: { lat: 28.6139, lng: 77.2090 } // New Delhi
    },
    {
      id: 10,
      title: "Green Energy Solutions Hackathon",
      organizer: "Ministry of New and Renewable Energy",
      location: "Pune, Maharashtra",
      date: "Mar 8-9, 2025",
      prize: "₹3,00,000",
      image: "https://images.unsplash.com/photo-1555725305-0406b7607be0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwY29uZmVyZW5jZSUyMGluZGlhfGVufDF8fHx8MTc2MTQwMjEzNHww&ixlib=rb-4.1.0&q=80&w=1080",
      status: "ongoing",
      registrationLink: "#",
      streams: ["All Streams"],
      region: "India",
      coordinates: { lat: 18.5204, lng: 73.8567 } // Pune
    },
    {
      id: 11,
      title: "Healthcare Innovation Challenge",
      organizer: "AIIMS & IIT Consortium",
      location: "Chennai, Tamil Nadu",
      date: "Mar 15-16, 2025",
      prize: "₹2,50,000",
      image: "https://images.unsplash.com/photo-1732210038512-bf24e8d750e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXJzJTIwY29kaW5nJTIwdGVhbXxlbnwxfHx8fDE3NjE0MDIxMzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "ongoing",
      registrationLink: "#",
      streams: ["All Streams"],
      region: "India",
      coordinates: { lat: 13.0827, lng: 80.2707 } // Chennai
    },
    // All Streams hackathons - International
    {
      id: 12,
      title: "World Innovation Summit",
      organizer: "Global Tech Alliance",
      location: "Singapore",
      date: "Mar 22-24, 2025",
      prize: "$50,000",
      image: "https://images.unsplash.com/photo-1733826544831-ad71d05c8423?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwY29tcGV0aXRpb258ZW58MXx8fHwxNzYxNDAyMTM0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "ongoing",
      registrationLink: "#",
      streams: ["All Streams"],
      region: "International",
      coordinates: { lat: 1.3521, lng: 103.8198 } // Singapore
    },
    {
      id: 13,
      title: "Asia Pacific Tech Challenge",
      organizer: "APAC Tech Forum",
      location: "Tokyo, Japan",
      date: "Apr 5-7, 2025",
      prize: "$40,000",
      image: "https://images.unsplash.com/photo-1565687981296-535f09db714e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWNrYXRob24lMjBjb2RpbmclMjBldmVudHxlbnwxfHx8fDE3NjEzOTQ4Njd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "ongoing",
      registrationLink: "#",
      streams: ["All Streams"],
      region: "International",
      coordinates: { lat: 35.6762, lng: 139.6503 } // Tokyo
    },
    {
      id: 14,
      title: "Sustainability Hackathon Global",
      organizer: "UN Tech Initiative",
      location: "London, UK",
      date: "Apr 12-14, 2025",
      prize: "£35,000",
      image: "https://images.unsplash.com/photo-1555725305-0406b7607be0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwY29uZmVyZW5jZSUyMGluZGlhfGVufDF8fHx8MTc2MTQwMjEzNHww&ixlib=rb-4.1.0&q=80&w=1080",
      status: "ongoing",
      registrationLink: "#",
      streams: ["All Streams"],
      region: "International",
      coordinates: { lat: 51.5074, lng: -0.1278 } // London
    },
  ];

  // Helper function to calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance);
  };

  // Filter hackathons by stream
  let filteredHackathons = selectedStream 
    ? allHackathons.filter(h => h.streams.includes(selectedStream))
    : allHackathons;

  // Further filter by location if nearby mode is active
  if (showNearbyEvents && userLocation) {
    filteredHackathons = filteredHackathons
      .map(hackathon => ({
        ...hackathon,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          hackathon.coordinates.lat,
          hackathon.coordinates.lng
        )
      }))
      .filter(h => h.distance <= 500) // Show events within 500km
      .sort((a, b) => a.distance - b.distance);
  }

  const indiaHackathons = filteredHackathons.filter(h => h.region === "India");
  const internationalHackathons = filteredHackathons.filter(h => h.region === "International");

  const handleStreamSelect = (stream: string) => {
    setSelectedStream(stream);
    setIsStreamDialogOpen(false);
  };

  const handleGetCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setShowManualLocation(true);
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLoadingLocation(false);
        toast.success("Location detected successfully!");
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLoadingLocation(false);
        
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location access denied. Please enter your location manually.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error("Location information unavailable. Please enter manually.");
        } else {
          toast.error("Unable to get location. Please enter manually.");
        }
        
        setShowManualLocation(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleManualLocationSubmit = () => {
    if (!manualAddress.trim()) {
      toast.error("Please enter a location");
      return;
    }

    // For demonstration, we'll use some major Indian cities as reference
    const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
      "delhi": { lat: 28.6139, lng: 77.2090 },
      "bangalore": { lat: 12.9716, lng: 77.5946 },
      "mumbai": { lat: 19.0760, lng: 72.8777 },
      "hyderabad": { lat: 17.3850, lng: 78.4867 },
      "chennai": { lat: 13.0827, lng: 80.2707 },
      "kolkata": { lat: 22.5726, lng: 88.3639 },
      "pune": { lat: 18.5204, lng: 73.8567 },
      "ahmedabad": { lat: 23.0225, lng: 72.5714 },
      "jaipur": { lat: 26.9124, lng: 75.7873 },
      "lucknow": { lat: 26.8467, lng: 80.9462 },
    };

    const lowerAddress = manualAddress.toLowerCase();
    let foundCity = false;

    for (const [city, coords] of Object.entries(cityCoordinates)) {
      if (lowerAddress.includes(city)) {
        setUserLocation({ ...coords, address: manualAddress });
        foundCity = true;
        toast.success(`Location set to ${city}`);
        break;
      }
    }

    if (!foundCity) {
      // Default to Delhi if city not recognized
      setUserLocation({ lat: 28.6139, lng: 77.2090, address: manualAddress });
      toast.success("Location set successfully");
    }

    setShowManualLocation(false);
    setManualAddress("");
  };

  const handleShowNearbyEvents = () => {
    if (!userLocation) {
      toast.error("Please set your location first");
      return;
    }

    setShowNearbyEvents(true);
    setIsNearbyDialogOpen(false);
    toast.success("Showing nearby hackathons within 500km");
  };

  const handleClearNearbyFilter = () => {
    setShowNearbyEvents(false);
    setUserLocation(null);
    setShowManualLocation(false);
    toast.info("Showing all hackathons");
  };

  // Initialize map when location is available
  useEffect(() => {
    if (userLocation && mapRef.current && !showManualLocation && isNearbyDialogOpen) {
      // Using Leaflet for the map
      import('leaflet').then((L) => {
        // Remove existing map instance if any
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        
        // Clear container
        mapRef.current!.innerHTML = '';
        
        // Small delay to ensure container is properly rendered
        setTimeout(() => {
          if (mapRef.current) {
            // Create map
            const map = L.map(mapRef.current!, {
              center: [userLocation.lat, userLocation.lng],
              zoom: 13,
              scrollWheelZoom: true,
            });
            
            mapInstanceRef.current = map;
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19,
            }).addTo(map);
            
            // Add marker with custom icon
            const customIcon = L.icon({
              iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCAzMiA0MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMEMxMC40Nzg1IDAgNiA0LjQ3ODUgNiAxMEM2IDE3LjUgMTYgMzIgMTYgMzJDMTYgMzIgMjYgMTcuNSAyNiAxMEMyNiA0LjQ3ODUgMjEuNTIxNSAwIDE2IDBaTTE2IDE0QzEzLjc5MTUgMTQgMTIgMTIuMjA4NSAxMiAxMEMxMiA3Ljc5MTUgMTMuNzkxNSA2IDE2IDZDMTguMjA4NSA2IDIwIDcuNzkxNSAyMCAxMEMyMCAxMi4yMDg1IDE4LjIwODUgMTQgMTYgMTRaIiBmaWxsPSIjRUYzMzQ1Ii8+PC9zdmc+',
              iconSize: [32, 42],
              iconAnchor: [16, 42],
              popupAnchor: [0, -42],
            });
            
            L.marker([userLocation.lat, userLocation.lng], { icon: customIcon })
              .addTo(map)
              .bindPopup('<strong>Your Location</strong>')
              .openPopup();
            
            // Invalidate size after a short delay to ensure proper rendering
            setTimeout(() => {
              map.invalidateSize();
            }, 100);
          }
        }, 150);
      });
    }
    
    return () => {
      // Cleanup map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation, showManualLocation, isNearbyDialogOpen]);

  const handleShare = async (hackathon: Hackathon) => {
    const shareText = `Check out ${hackathon.title} - ${hackathon.organizer}\nLocation: ${hackathon.location}\nDate: ${hackathon.date}\nPrize: ${hackathon.prize}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: hackathon.title,
          text: shareText,
          url: hackathon.registrationLink,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareText);
      toast.success("Hackathon details copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-black text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl tracking-tight">
                Tech<span className="inline-block transform -skew-x-12 bg-white text-black px-2">i</span>fy
              </span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              <Button
                variant={currentView === "home" ? "secondary" : "ghost"}
                onClick={() => setCurrentView("home")}
                className={currentView === "home" ? "bg-white text-black hover:bg-gray-200" : "text-white hover:bg-gray-800"}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>

              {/* Nearby Dialog Trigger */}
              <Dialog 
                open={isNearbyDialogOpen} 
                onOpenChange={(open) => {
                  setIsNearbyDialogOpen(open);
                  if (!open) {
                    // Clean up map when dialog closes
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.remove();
                      mapInstanceRef.current = null;
                    }
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant={showNearbyEvents ? "secondary" : "ghost"}
                    className={showNearbyEvents ? "bg-white text-black hover:bg-gray-200" : "text-white hover:bg-gray-800"}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Nearby
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Find Nearby Hackathons</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    {!userLocation && !showManualLocation && (
                      <div className="space-y-4">
                        <p className="text-gray-600">
                          Allow location access to find hackathons near you
                        </p>
                        <Button
                          onClick={handleGetCurrentLocation}
                          disabled={isLoadingLocation}
                          className="w-full bg-black hover:bg-gray-800"
                        >
                          {isLoadingLocation ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Getting Location...
                            </>
                          ) : (
                            <>
                              <Navigation className="h-4 w-4 mr-2" />
                              Use Current Location
                            </>
                          )}
                        </Button>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-white px-2 text-gray-500">Or</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => setShowManualLocation(true)}
                          variant="outline"
                          className="w-full"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Enter Location Manually
                        </Button>
                      </div>
                    )}

                    {showManualLocation && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="manual-location">Enter Your City or Address</Label>
                          <Input
                            id="manual-location"
                            placeholder="e.g., Bangalore, Mumbai, Delhi..."
                            value={manualAddress}
                            onChange={(e) => setManualAddress(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleManualLocationSubmit();
                              }
                            }}
                          />
                          <p className="text-sm text-gray-500">
                            Enter a major Indian city name
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setShowManualLocation(false);
                              setManualAddress("");
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            Back
                          </Button>
                          <Button
                            onClick={handleManualLocationSubmit}
                            className="flex-1 bg-black hover:bg-gray-800"
                          >
                            Set Location
                          </Button>
                        </div>
                      </div>
                    )}

                    {userLocation && !showManualLocation && (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800">
                            ✓ Location detected successfully!
                          </p>
                          {userLocation.address && (
                            <p className="text-sm text-green-600 mt-1">
                              {userLocation.address}
                            </p>
                          )}
                        </div>

                        {/* Map Container */}
                        <div className="w-full h-64 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100">
                          <div 
                            ref={mapRef} 
                            className="w-full h-full"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setUserLocation(null);
                              setShowManualLocation(false);
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            Change Location
                          </Button>
                          <Button
                            onClick={handleShowNearbyEvents}
                            className="flex-1 bg-black hover:bg-gray-800"
                          >
                            Show Nearby Events
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* Stream Dialog Trigger */}
              <Dialog open={isStreamDialogOpen} onOpenChange={setIsStreamDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant={selectedStream ? "secondary" : "ghost"}
                    className={selectedStream ? "bg-white text-black hover:bg-gray-200" : "text-white hover:bg-gray-800"}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Stream
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Select Your Stream</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-gray-600 mb-4">Choose your field of study to see relevant hackathons</p>
                    <div className="grid gap-2 max-h-96 overflow-y-auto">
                      {streams.map((stream) => (
                        <Button
                          key={stream}
                          variant={selectedStream === stream ? "default" : "outline"}
                          className={selectedStream === stream ? "bg-black text-white hover:bg-gray-800 justify-start" : "justify-start hover:bg-gray-100"}
                          onClick={() => handleStreamSelect(stream)}
                        >
                          {stream}
                        </Button>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant={currentView === "profile" ? "secondary" : "ghost"}
                onClick={() => setCurrentView("profile")}
                className={currentView === "profile" ? "bg-white text-black hover:bg-gray-200" : "text-white hover:bg-gray-800"}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentView === "home" ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Nearby Events Status */}
            {showNearbyEvents && userLocation && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation className="h-5 w-5 text-blue-600" />
                    <p className="text-blue-900">Showing nearby hackathons within 500km</p>
                  </div>
                  {userLocation.address && (
                    <p className="text-sm text-blue-600">Location: {userLocation.address}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearNearbyFilter}
                  className="border-blue-300 hover:bg-blue-100"
                >
                  Clear Filter
                </Button>
              </div>
            )}

            {/* Stream Selection Status */}
            {selectedStream && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Showing hackathons for:</p>
                  <p className="text-black">{selectedStream}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStream(null)}
                >
                  Clear Filter
                </Button>
              </div>
            )}

            {/* India Hackathons Section */}
            {indiaHackathons.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="mb-2 text-black">Ongoing Hackathons in India</h2>
                    <p className="text-gray-600">
                      Discover and participate in exciting hackathons happening across India
                    </p>
                  </div>
                </div>

                {/* Hackathons Vertical Layout */}
                <div className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {indiaHackathons.map((hackathon) => (
                      <Card
                        key={hackathon.id}
                        className="hover:shadow-xl transition-shadow"
                      >
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <ImageWithFallback
                            src={hackathon.image}
                            alt={hackathon.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-green-500 text-white">
                              {hackathon.status === "ongoing" ? "Registrations Open" : "Upcoming"}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="mb-2 text-black">{hackathon.title}</h3>
                          <p className="text-gray-600 mb-4">{hackathon.organizer}</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{hackathon.location}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{hackathon.date}</span>
                            </div>
                            {showNearbyEvents && userLocation && 'distance' in hackathon && (
                              <div className="flex items-center text-blue-600">
                                <Navigation className="h-4 w-4 mr-2" />
                                <span className="font-medium">{(hackathon as any).distance} km away</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <p className="text-gray-500">Prize Pool</p>
                              <p className="text-black">{hackathon.prize}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleShare(hackathon)}
                                className="border-gray-300 hover:bg-gray-100"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button
                                className="bg-black hover:bg-gray-800"
                                onClick={() => window.open(hackathon.registrationLink, '_blank')}
                              >
                                Register
                                <ExternalLink className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* International Hackathons Section */}
            {internationalHackathons.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="mb-2 text-black">International Hackathons</h2>
                    <p className="text-gray-600">
                      Global opportunities to showcase your skills on an international stage
                    </p>
                  </div>
                </div>

                {/* Hackathons Vertical Layout */}
                <div className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {internationalHackathons.map((hackathon) => (
                      <Card
                        key={hackathon.id}
                        className="hover:shadow-xl transition-shadow"
                      >
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <ImageWithFallback
                            src={hackathon.image}
                            alt={hackathon.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-blue-500 text-white">
                              International
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="mb-2 text-black">{hackathon.title}</h3>
                          <p className="text-gray-600 mb-4">{hackathon.organizer}</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{hackathon.location}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{hackathon.date}</span>
                            </div>
                            {showNearbyEvents && userLocation && 'distance' in hackathon && (
                              <div className="flex items-center text-blue-600">
                                <Navigation className="h-4 w-4 mr-2" />
                                <span className="font-medium">{(hackathon as any).distance} km away</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <p className="text-gray-500">Prize Pool</p>
                              <p className="text-black">{hackathon.prize}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleShare(hackathon)}
                                className="border-gray-300 hover:bg-gray-100"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button
                                className="bg-black hover:bg-gray-800"
                                onClick={() => window.open(hackathon.registrationLink, '_blank')}
                              >
                                Register
                                <ExternalLink className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* No Results Message */}
            {filteredHackathons.length === 0 && selectedStream && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="mb-2 text-gray-600">No hackathons found</h3>
                <p className="text-gray-500 mb-6">
                  There are no hackathons available for {selectedStream} at the moment.
                </p>
                <Button
                  onClick={() => setSelectedStream(null)}
                  className="bg-black hover:bg-gray-800"
                >
                  View All Hackathons
                </Button>
              </div>
            )}

            {/* Create Posters Info */}
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
              <h3 className="mb-2 text-black">Create Posters for Your Events</h3>
              <p className="text-gray-600 mb-4">
                Design stunning posters for hackathons, events, and more using our tools
              </p>
              <Button
                onClick={() => setCurrentView("profile")}
                className="bg-black hover:bg-gray-800"
              >
                Go to Profile to Create Posters
              </Button>
            </div>
          </div>
        ) : (
          <ProfileView />
        )}
      </main>
    </div>
  );
}
