import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, Search, Navigation, MapPin, Loader2, Home, Briefcase, Map, Plus, Minus, Target, Clock, AlertCircle } from "lucide-react";
import { useAddressStore } from "@/lib/address-store";
import { LocationService, GeocodeResult } from "@/lib/services/location-service";
import { AddressService } from "@/lib/services/address-service";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";

// Custom premium marker (used natively outside leaflet now)
const PinIcon = ({ isDragging }: { isDragging: boolean }) => {
  return (
    <div className="relative flex flex-col items-center">
      {/* Pulse effect when NOT dragging */}
      {!isDragging && (
        <div className="absolute top-[20px] w-8 h-8 bg-emerald-500/40 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
      )}
      
      {/* The Pin */}
      <div 
        className="relative z-10 transition-transform duration-300 ease-out drop-shadow-md"
        style={{ transform: isDragging ? 'translateY(-18px)' : 'translateY(0)' }}
      >
        <div className="w-10 h-10 bg-emerald-500 rounded-[50%_50%_50%_0] rotate-[-45deg] flex items-center justify-center shadow-[0_8px_16px_rgba(16,185,129,0.4)] border-[2.5px] border-white">
          <div className="w-3 h-3 bg-white rounded-full shadow-inner" />
        </div>
      </div>
      
      {/* Shadow */}
      <div 
        className="w-[14px] h-[5px] bg-black/30 rounded-[50%] mt-1 transition-all duration-300 blur-[1px]"
        style={{ transform: isDragging ? 'scale(0.4)' : 'scale(1)', opacity: isDragging ? 0.3 : 1 }}
      />
    </div>
  );
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

function MapController({ 
  center, 
  onMapMove,
  onDragStart
}: { 
  center: [number, number]; 
  onMapMove: (lat: number, lng: number) => void;
  onDragStart: () => void;
}) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, 16, { animate: true, duration: 1 });
  }, [center, map]);

  useMapEvents({
    movestart: () => {
      onDragStart();
    },
    moveend: () => {
      const newCenter = map.getCenter();
      onMapMove(newCenter.lat, newCenter.lng);
    }
  });

  return null;
}

function CustomMapControls({ onCurrentLocation }: { onCurrentLocation: () => void }) {
  const map = useMap();
  
  return (
    <div className="absolute bottom-6 right-4 z-[400] flex flex-col gap-3">
      <button 
        onClick={(e) => { e.preventDefault(); onCurrentLocation(); }}
        className="bg-white/90 backdrop-blur-md text-[#1C1C1E] size-12 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-white/50 hover:bg-white hover:scale-105 active:scale-95 transition-all"
      >
        <Target className="size-5" />
      </button>

      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-white/50 flex flex-col overflow-hidden">
        <button 
          onClick={(e) => { e.preventDefault(); map.zoomIn(); }}
          className="size-11 flex items-center justify-center text-[#1C1C1E] hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-100/50"
        >
          <Plus className="size-5" />
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); map.zoomOut(); }}
          className="size-11 flex items-center justify-center text-[#1C1C1E] hover:bg-slate-50 active:bg-slate-100 transition-colors"
        >
          <Minus className="size-5" />
        </button>
      </div>
    </div>
  );
}

export function AddressPickerModal({ isOpen, onClose, onSaved }: Props) {
  const { editingAddress, addAddress, updateAddress } = useAddressStore();
  
  // Default coordinates (e.g. New Delhi) if no address is provided
  const defaultCoords: [number, number] = [28.6139, 77.2090];
  
  const [mapCenter, setMapCenter] = useState<[number, number]>(editingAddress?.coordinates || defaultCoords);
  const [markerPos, setMarkerPos] = useState<[number, number]>(editingAddress?.coordinates || defaultCoords);
  
  const [isDragging, setIsDragging] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [geocodeData, setGeocodeData] = useState<GeocodeResult | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Form state
  const [house, setHouse] = useState(editingAddress?.line1 || "");
  const [landmark, setLandmark] = useState(editingAddress?.line2 || "");
  const [addressType, setAddressType] = useState<"Home"|"Work"|"Other">(editingAddress?.type || "Home");
  const [saving, setSaving] = useState(false);

  // Re-initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMapCenter(editingAddress?.coordinates || defaultCoords);
      setMarkerPos(editingAddress?.coordinates || defaultCoords);
      setHouse(editingAddress?.line1 || "");
      setLandmark(editingAddress?.line2 || "");
      setAddressType(editingAddress?.type || "Home");
    }
  }, [isOpen, editingAddress]);

  // Debounced reverse geocode to avoid rate limits
  useEffect(() => {
    let active = true;
    const fetchAddress = async () => {
      setLoadingAddress(true);
      const res = await LocationService.reverseGeocode(markerPos[0], markerPos[1]);
      if (active && res) {
        setGeocodeData(res);
      }
      if (active) setLoadingAddress(false);
    };
    
    const timeout = setTimeout(fetchAddress, 400); // 400ms debounce
    return () => { active = false; clearTimeout(timeout); };
  }, [markerPos]);

  // Forward geocode search
  useEffect(() => {
    if (!debouncedSearch) {
      setSearchResults([]);
      return;
    }
    const search = async () => {
      setIsSearching(true);
      const res = await LocationService.searchAddress(debouncedSearch);
      setSearchResults(res);
      setIsSearching(false);
    };
    search();
  }, [debouncedSearch]);

  const handleCurrentLocation = (retry = false) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    toast.info(retry ? "Retrying with high GPS accuracy..." : "Getting current location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!retry && pos.coords.accuracy > 1500) {
          handleCurrentLocation(true);
          return;
        }
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter(coords);
        setMarkerPos(coords);
      },
      (err) => {
        if (!retry) {
           handleCurrentLocation(true);
        } else {
           toast.error("Permission denied or location unavailable");
        }
      },
      { enableHighAccuracy: retry, timeout: 8000, maximumAge: retry ? 0 : 60000 }
    );
  };

  const handleSelectSearchResult = (result: GeocodeResult) => {
    setMapCenter([result.lat, result.lng]);
    setMarkerPos([result.lat, result.lng]);
    setGeocodeData(result);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSave = async () => {
    if (!geocodeData) return;
    if (!house) {
      toast.error("Please enter House/Flat number");
      return;
    }

    setSaving(true);
    try {
      const fullAddress = `${house}, ${geocodeData.road}`;
      const addressData = {
        type: addressType,
        recipientName: editingAddress?.recipientName || "User", // Would come from profile in real app
        phone: editingAddress?.phone || "",
        line1: fullAddress,
        line2: landmark,
        city: geocodeData.city || "Unknown City",
        state: geocodeData.state || "Unknown State",
        pinCode: geocodeData.postcode || "000000",
        isDefault: editingAddress ? editingAddress.isDefault : true,
        coordinates: [geocodeData.lat, geocodeData.lng] as [number, number]
      };
      
      if (editingAddress) {
        await updateAddress(editingAddress.id, addressData);
        toast.success("Address updated successfully!");
      } else {
        await addAddress(addressData);
        toast.success("Address saved successfully!");
      }
      
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col md:items-center md:justify-center p-0 md:p-4 font-sans">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-white w-full md:max-w-2xl md:rounded-[32px] md:h-[85vh] h-full relative z-10 flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white relative z-20">
              <h2 className="text-lg font-bold text-[#1C1C1E]">Select Location</h2>
              <button onClick={onClose} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                <X className="size-5 text-slate-500" />
              </button>
            </div>

            {/* Search Bar overlay */}
            <div className="absolute top-20 left-4 right-4 z-30 pointer-events-none">
              <div className="relative pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl bg-white/90 backdrop-blur-xl border border-white/40 overflow-hidden">
                <div className="flex items-center px-4 h-14">
                  <Search className="size-5 text-emerald-500 shrink-0" />
                  <input 
                    type="text"
                    placeholder="Search area, street, landmark..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full h-full border-none focus:ring-0 text-[15px] font-semibold text-[#1C1C1E] placeholder-slate-400 pl-3 bg-transparent"
                  />
                  {isSearching && <Loader2 className="size-5 animate-spin text-emerald-500 shrink-0" />}
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto overflow-hidden">
                    {searchResults.map((res, i) => (
                      <div 
                        key={i} 
                        onClick={() => handleSelectSearchResult(res)}
                        className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex items-start gap-3"
                      >
                        <MapPin className="size-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-[#1C1C1E] line-clamp-1">{res.road || res.city}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{res.formattedAddress}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Map Area */}
            <div className="relative flex-1 bg-slate-100 z-10 overflow-hidden">
              <MapContainer 
                center={mapCenter} 
                zoom={16} 
                zoomControl={false}
                className="w-full h-full"
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                
                <MapController 
                  center={mapCenter} 
                  onDragStart={() => setIsDragging(true)}
                  onMapMove={(lat, lng) => {
                    setIsDragging(false);
                    setMarkerPos([lat, lng]);
                  }} 
                />

                <CustomMapControls onCurrentLocation={() => handleCurrentLocation(false)} />
              </MapContainer>

              {/* Fixed Center Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100%] pointer-events-none z-[400] drop-shadow-xl pb-2">
                <PinIcon isDragging={isDragging} />
              </div>
            </div>

            {/* Address Form Area - Premium Frosted */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-t-[32px] -mt-6 z-20 relative shadow-[0_-10px_40px_rgba(0,0,0,0.08)] p-6 flex flex-col shrink-0 max-h-[60vh] overflow-y-auto border-t border-white">
              
              {/* Reverse Geocode Result */}
              <div className="flex items-start gap-4 mb-6">
                <div className="size-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-emerald-100/50">
                  <MapPin className="size-6" />
                </div>
                <div className="flex-1 pt-0.5">
                  {loadingAddress ? (
                    <div className="space-y-2 py-1">
                      <div className="h-5 bg-slate-200 rounded w-2/3 animate-pulse" />
                      <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
                    </div>
                  ) : geocodeData ? (
                    <>
                      <h3 className="font-bold text-[#1C1C1E] text-[17px] tracking-tight line-clamp-1">
                        {geocodeData.road || geocodeData.city || "Unknown Area"}
                      </h3>
                      <p className="text-[14px] text-slate-500 line-clamp-2 leading-snug mt-1 font-medium">
                        {geocodeData.formattedAddress}
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-500 text-sm pt-2 font-medium">Drag map to select precise location</p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3.5 mb-6">
                <input 
                  type="text" 
                  placeholder="House / Flat / Block No. *" 
                  value={house}
                  onChange={e => setHouse(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl px-5 py-4 text-[15px] font-semibold text-[#1C1C1E] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
                <input 
                  type="text" 
                  placeholder="Landmark (Optional)" 
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl px-5 py-4 text-[15px] font-semibold text-[#1C1C1E] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
                
                <div className="flex gap-2.5 pt-2">
                  {(["Home", "Work", "Other"] as const).map(type => {
                    const Icon = type === "Home" ? Home : type === "Work" ? Briefcase : Map;
                    return (
                      <button
                        key={type}
                        onClick={() => setAddressType(type)}
                        className={`flex-1 py-3 rounded-2xl border flex items-center justify-center gap-2 text-[14px] font-bold transition-all ${
                          addressType === type 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm" 
                            : "bg-white border-slate-200/60 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="size-4.5" /> {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Status */}
              {geocodeData && (
                <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 mb-6">
                  <div className="size-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                    <Clock className="size-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-sm font-bold text-emerald-700">Delivery Available</p>
                    </div>
                    <p className="text-xs font-semibold text-emerald-600/80 mt-0.5">Estimated in 10-15 mins</p>
                  </div>
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={handleSave}
                disabled={saving || loadingAddress || !geocodeData}
                className="w-full bg-emerald-500 text-white font-bold py-4 rounded-[20px] shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center"
              >
                {saving ? <Loader2 className="size-5 animate-spin" /> : "Confirm Location"}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
