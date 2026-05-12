import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Plus, Image as ImageIcon, Type, Palette, Grid3x3, Settings, Camera, FolderOpen, MapPin, Calendar, Link as LinkIcon, ArrowRight, Heart, Share2, Trash2, Edit, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Poster {
  id: string;
  eventName: string;
  location: string;
  dateTime: string;
  registrationLink: string;
  image: string;
  createdAt: Date;
  likes: number;
  isLiked: boolean;
}

export function ProfileView() {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [step, setStep] = useState<"select-source" | "add-details">("select-source");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedPoster, setSelectedPoster] = useState<Poster | null>(null);
  const [isPosterDetailOpen, setIsPosterDetailOpen] = useState(false);
  const [isEditingPoster, setIsEditingPoster] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const [newPoster, setNewPoster] = useState({
    eventName: "",
    location: "",
    dateTime: "",
    registrationLink: "",
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setStep("add-details");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePoster = () => {
    if (!selectedImage) {
      toast.error("Please select an image");
      return;
    }
    if (!newPoster.eventName) {
      toast.error("Please enter event name");
      return;
    }
    if (!newPoster.location) {
      toast.error("Please enter location");
      return;
    }
    if (!newPoster.dateTime) {
      toast.error("Please enter date and time");
      return;
    }

    if (isEditingPoster && selectedPoster) {
      // Update existing poster
      const updatedPosters = posters.map((p) => 
        p.id === selectedPoster.id 
          ? {
              ...p,
              eventName: newPoster.eventName,
              location: newPoster.location,
              dateTime: newPoster.dateTime,
              registrationLink: newPoster.registrationLink,
              image: selectedImage,
            }
          : p
      );
      setPosters(updatedPosters);
      toast.success("Poster updated successfully!");
    } else {
      // Create new poster
      const poster: Poster = {
        id: Date.now().toString(),
        eventName: newPoster.eventName,
        location: newPoster.location,
        dateTime: newPoster.dateTime,
        registrationLink: newPoster.registrationLink,
        image: selectedImage,
        createdAt: new Date(),
        likes: 0,
        isLiked: false,
      };

      setPosters([poster, ...posters]);
      toast.success("Poster created successfully!");
    }

    setIsDialogOpen(false);
    resetPosterForm();
  };

  const resetPosterForm = () => {
    setStep("select-source");
    setSelectedImage("");
    setIsEditingPoster(false);
    setSelectedPoster(null);
    setNewPoster({
      eventName: "",
      location: "",
      dateTime: "",
      registrationLink: "",
    });
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetPosterForm();
    }
  };

  const handleLike = (posterId: string) => {
    setPosters(posters.map(poster => 
      poster.id === posterId 
        ? { 
            ...poster, 
            likes: poster.isLiked ? poster.likes - 1 : poster.likes + 1,
            isLiked: !poster.isLiked 
          }
        : poster
    ));
    
    if (selectedPoster?.id === posterId) {
      setSelectedPoster(prev => prev ? {
        ...prev,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
        isLiked: !prev.isLiked
      } : null);
    }
  };

  const handleShare = async (poster: Poster) => {
    const shareText = `Check out ${poster.eventName}!\n\nLocation: ${poster.location}\nDate: ${poster.dateTime}${poster.registrationLink ? `\nRegister: ${poster.registrationLink}` : ''}`;
    
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: poster.eventName,
          text: shareText,
          url: poster.registrationLink || window.location.href,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          fallbackShare(poster, shareText);
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      fallbackShare(poster, shareText);
    }
  };

  const fallbackShare = (poster: Poster, shareText: string) => {
    // WhatsApp share link
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    toast.success("Opening WhatsApp...");
  };

  const handleDelete = (posterId: string) => {
    setPosters(posters.filter(poster => poster.id !== posterId));
    setIsPosterDetailOpen(false);
    setSelectedPoster(null);
    toast.success("Poster deleted successfully!");
  };

  const handleEdit = (poster: Poster) => {
    setSelectedPoster(poster);
    setIsEditingPoster(true);
    setSelectedImage(poster.image);
    setNewPoster({
      eventName: poster.eventName,
      location: poster.location,
      dateTime: poster.dateTime,
      registrationLink: poster.registrationLink,
    });
    setStep("add-details");
    setIsPosterDetailOpen(false);
    setIsDialogOpen(true);
  };

  const handlePosterClick = (poster: Poster) => {
    setSelectedPoster(poster);
    setIsPosterDetailOpen(true);
  };

  const handleProfilePictureSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
        setIsEditProfileOpen(false);
        toast.success("Profile picture updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProfilePicture = () => {
    setProfilePicture("");
    setIsEditProfileOpen(false);
    toast.success("Profile picture removed!");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Instagram-style Profile Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-2 border-gray-200">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <AvatarFallback className="bg-gray-100 text-gray-600">UN</AvatarFallback>
              )}
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-4 mb-6">
              <h2 className="text-black">username</h2>
              <div className="flex gap-2">
                <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Profile Picture</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Current Profile Picture Display */}
                      <div className="flex flex-col items-center gap-4">
                        <Avatar className="w-32 h-32 border-2 border-gray-200">
                          {profilePicture ? (
                            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <AvatarFallback className="bg-gray-100 text-gray-600">UN</AvatarFallback>
                          )}
                        </Avatar>
                        <p className="text-gray-600">Current Profile Picture</p>
                      </div>

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={profilePicInputRef}
                        onChange={handleProfilePictureSelect}
                        accept="image/*"
                        className="hidden"
                      />

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full h-12 flex items-center justify-center gap-2 hover:bg-gray-50"
                          onClick={() => profilePicInputRef.current?.click()}
                        >
                          <FolderOpen className="h-5 w-5" />
                          Set Profile Picture
                        </Button>

                        {profilePicture && (
                          <Button
                            variant="outline"
                            className="w-full h-12 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
                            onClick={handleDeleteProfilePicture}
                          >
                            Delete Profile Picture
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => setIsEditProfileOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start gap-8">
              <div className="text-center md:text-left">
                <span className="block">{posters.length}</span>
                <span className="text-gray-600">posts</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Grid3x3 className="h-5 w-5" />
            <span>POSTS</span>
          </div>
          
          {/* Create Poster Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button className="bg-black hover:bg-gray-800" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Poster
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {step === "select-source" 
                    ? (isEditingPoster ? "Change Image Source" : "Select Image Source")
                    : (isEditingPoster ? "Edit Event Details" : "Add Event Details")}
                </DialogTitle>
              </DialogHeader>
              
              {step === "select-source" ? (
                <div className="space-y-4 py-4">
                  <p className="text-gray-600">Choose how you want to add an image for your poster</p>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />
                  
                  <div className="grid gap-4">
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FolderOpen className="h-8 w-8 text-gray-600" />
                      <span>Choose from Gallery</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera className="h-8 w-8 text-gray-600" />
                      <span>Take Photo</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  {/* Image Preview */}
                  {selectedImage && (
                    <div className="space-y-2">
                      <Label>Selected Image</Label>
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                        <img 
                          src={selectedImage} 
                          alt="Selected" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setStep("select-source");
                          setSelectedImage("");
                        }}
                        className="w-full text-blue-500"
                      >
                        Change Image
                      </Button>
                    </div>
                  )}

                  {/* Event Details Form */}
                  <div className="space-y-2">
                    <Label htmlFor="event-name">Event Name *</Label>
                    <div className="relative">
                      <Type className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="event-name"
                        value={newPoster.eventName}
                        onChange={(e) => setNewPoster({ ...newPoster, eventName: e.target.value })}
                        className="pl-10"
                        placeholder="e.g., Smart India Hackathon"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        value={newPoster.location}
                        onChange={(e) => setNewPoster({ ...newPoster, location: e.target.value })}
                        className="pl-10"
                        placeholder="e.g., Mumbai, Maharashtra"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date-time">Date & Time *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="date-time"
                        value={newPoster.dateTime}
                        onChange={(e) => setNewPoster({ ...newPoster, dateTime: e.target.value })}
                        className="pl-10"
                        placeholder="e.g., Jan 15-17, 2025"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registration-link">Registration Link (Optional)</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="registration-link"
                        value={newPoster.registrationLink}
                        onChange={(e) => setNewPoster({ ...newPoster, registrationLink: e.target.value })}
                        className="pl-10"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep("select-source");
                        setSelectedImage("");
                      }}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleCreatePoster}
                      className="flex-1 bg-black hover:bg-gray-800"
                    >
                      {isEditingPoster ? "Update Poster" : "Create Poster"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Instagram-style Posters Grid */}
      {posters.length === 0 ? (
        <div className="text-center py-16">
          <div className="border-2 border-black rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="h-8 w-8 text-black" />
          </div>
          <h3 className="mb-2 text-black">Share Photos</h3>
          <p className="text-gray-600 mb-6">
            When you create posters, they'll appear on your profile.
          </p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            variant="link"
            className="text-blue-500"
          >
            Create your first poster
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {posters.map((poster) => (
            <div
              key={poster.id}
              className="aspect-square cursor-pointer hover:opacity-80 transition-opacity relative overflow-hidden rounded"
              onClick={() => handlePosterClick(poster)}
            >
              <img 
                src={poster.image} 
                alt={poster.eventName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-2 md:p-3">
                <p className="text-white text-xs md:text-sm line-clamp-1">{poster.eventName}</p>
                <p className="text-white/80 text-[10px] md:text-xs line-clamp-1">
                  {poster.location}
                </p>
                <p className="text-white/70 text-[10px] md:text-xs line-clamp-1">
                  {poster.dateTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Poster Detail Dialog */}
      <Dialog open={isPosterDetailOpen} onOpenChange={setIsPosterDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          {selectedPoster && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPoster.eventName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Poster Image */}
                <div className="relative w-full rounded-lg overflow-hidden">
                  <img 
                    src={selectedPoster.image} 
                    alt={selectedPoster.eventName}
                    className="w-full max-h-96 object-contain bg-gray-100"
                  />
                </div>

                {/* Poster Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedPoster.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedPoster.dateTime}</span>
                  </div>
                  {selectedPoster.registrationLink && (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-gray-700" />
                      <a 
                        href={selectedPoster.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1"
                      >
                        Registration Link
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                    onClick={() => handleLike(selectedPoster.id)}
                  >
                    <Heart 
                      className={`h-4 w-4 ${selectedPoster.isLiked ? 'fill-red-500 text-red-500' : ''}`}
                    />
                    <span>{selectedPoster.likes}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                    onClick={() => handleShare(selectedPoster)}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                    onClick={() => handleEdit(selectedPoster)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </div>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
                  onClick={() => handleDelete(selectedPoster.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Poster
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
