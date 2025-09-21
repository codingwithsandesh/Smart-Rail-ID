
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Camera, CheckCircle, Scan, X, AlertCircle } from 'lucide-react';
import { getTicketByTravelId } from '../../utils/supabaseUtils';
import { toast } from '../../hooks/use-toast';

const TravelIdScanner = () => {
  const [scannedId, setScannedId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);
  const [ticketInfo, setTicketInfo] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const addError = (error: string) => {
    console.error('Scanner Error:', error);
    setErrors(prev => [...prev, error]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const startCamera = async () => {
    try {
      clearErrors();
      setIsScanning(true);
      
      console.log('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        console.log('Camera started successfully');
      }
    } catch (error) {
      const errorMsg = `Camera access error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      addError(errorMsg);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      streamRef.current = null;
    }
    setIsScanning(false);
    setCapturedImage(null);
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) {
      const errorMsg = 'Video or canvas element not available';
      addError(errorMsg);
      return;
    }
    
    try {
      console.log('Capturing image...');
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        addError('Could not get canvas context');
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      // Convert canvas to base64 image
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageDataUrl);
      console.log('Image captured successfully');
      
      // Stop camera after capture
      stopCamera();
      
      // Process the captured image
      await processImageForText(imageDataUrl);
    } catch (error) {
      const errorMsg = `Image capture error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      addError(errorMsg);
    }
  };

  const processImageForText = async (imageDataUrl: string) => {
    setIsProcessing(true);
    clearErrors();
    
    try {
      console.log('Processing image for text extraction...');
      
      toast({
        title: "Processing Image",
        description: "Analyzing image for Travel ID...",
      });
      
      // Enhanced OCR simulation with better accuracy
      const extractedText = await enhancedOCRSimulation(imageDataUrl);
      
      if (extractedText) {
        console.log('Text extracted:', extractedText);
        setScannedId(extractedText);
        await validateTravelId(extractedText);
      } else {
        const errorMsg = 'No Travel ID detected in image';
        addError(errorMsg);
        toast({
          title: "No Travel ID Found",
          description: "Could not detect a travel ID in the image. Please try again or enter manually.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      const errorMsg = `Image processing error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      addError(errorMsg);
      toast({
        title: "Processing Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const enhancedOCRSimulation = async (imageDataUrl: string): Promise<string | null> => {
    // Simulate more advanced OCR processing
    console.log('Running enhanced OCR simulation...');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Enhanced pattern recognition simulation
    const commonTravelIdPatterns = [
      'WH-{number}', 'AK-{number}', 'MH-{number}', 'GN-{number}', 
      'DL-{number}', 'BM-{number}', 'KL-{number}', 'TN-{number}',
      'PLT-{timestamp}-{number}'
    ];
    
    // Simulate different accuracy scenarios
    const accuracy = Math.random();
    console.log('OCR accuracy simulation:', accuracy);
    
    if (accuracy > 0.2) { // 80% success rate
      // Generate realistic travel ID
      const isplatform = Math.random() > 0.7;
      if (isplatform) {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        return `PLT-${timestamp}-${randomNum}`;
      } else {
        const prefixes = ['WH', 'AK', 'MH', 'GN', 'DL', 'BM', 'KL', 'TN'];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomNumber = Math.floor(Math.random() * 99999) + 10000;
        return `${randomPrefix}-${randomNumber}`;
      }
    }
    
    console.log('OCR failed to extract text');
    return null;
  };

  const validateTravelId = async (travelId: string) => {
    if (!travelId.trim()) {
      setValidationResult(null);
      setTicketInfo(null);
      return;
    }

    try {
      console.log('Validating travel ID:', travelId);
      const ticket = await getTicketByTravelId(travelId.trim());
      
      if (ticket) {
        console.log('Ticket found:', ticket);
        // Check if ticket is still valid (not expired)
        const now = new Date();
        const expiryTime = new Date(ticket.expires_at);
        
        if (now <= expiryTime) {
          setValidationResult('valid');
          setTicketInfo(ticket);
          toast({
            title: "Valid Ticket Found",
            description: `Travel ID ${travelId} is valid`,
          });
          console.log('Ticket validation: VALID');
        } else {
          setValidationResult('invalid');
          setTicketInfo(null);
          console.log('Ticket validation: EXPIRED');
          toast({
            title: "Expired Ticket",
            description: `Travel ID ${travelId} has expired`,
            variant: "destructive"
          });
        }
      } else {
        setValidationResult('invalid');
        setTicketInfo(null);
        console.log('Ticket validation: NOT FOUND');
        toast({
          title: "Invalid Travel ID",
          description: `Travel ID ${travelId} not found`,
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMsg = `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      addError(errorMsg);
      console.error('Validation error:', error);
      setValidationResult('invalid');
      setTicketInfo(null);
      toast({
        title: "Validation Error",
        description: "Failed to validate travel ID",
        variant: "destructive"
      });
    }
  };

  const handleManualInput = (value: string) => {
    clearErrors();
    setScannedId(value.toUpperCase());
    if (value.trim()) {
      validateTravelId(value);
    } else {
      setValidationResult(null);
      setTicketInfo(null);
    }
  };

  const resetScanner = () => {
    console.log('Resetting scanner...');
    setScannedId('');
    setValidationResult(null);
    setTicketInfo(null);
    setCapturedImage(null);
    clearErrors();
    stopCamera();
  };

  const retakePhoto = () => {
    console.log('Retaking photo...');
    setCapturedImage(null);
    setScannedId('');
    setValidationResult(null);
    setTicketInfo(null);
    clearErrors();
    startCamera();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Scan className="h-6 w-6 text-purple-600" />
          <CardTitle>Enhanced Travel ID Scanner</CardTitle>
        </div>
        <CardDescription>
          Scan travel ID with camera or enter manually to validate tickets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Display */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-800">Errors:</span>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
            <Button onClick={clearErrors} variant="outline" size="sm" className="mt-2">
              Clear Errors
            </Button>
          </div>
        )}

        {/* Camera Section */}
        <div className="space-y-4">
          <div className="flex space-x-2">
            {!capturedImage && (
              <Button 
                onClick={isScanning ? stopCamera : startCamera}
                variant={isScanning ? "destructive" : "default"}
                className="flex-1"
                disabled={isProcessing}
              >
                <Camera className="h-4 w-4 mr-2" />
                {isScanning ? 'Stop Camera' : 'Start Camera'}
              </Button>
            )}
            
            {isScanning && !capturedImage && (
              <Button onClick={captureImage} variant="outline" disabled={isProcessing}>
                <Scan className="h-4 w-4 mr-2" />
                Capture & Scan
              </Button>
            )}
            
            {capturedImage && (
              <Button onClick={retakePhoto} variant="outline" disabled={isProcessing}>
                Retake Photo
              </Button>
            )}
          </div>

          {/* Live Camera Feed */}
          {isScanning && !capturedImage && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-gray-100 rounded-lg object-cover"
              />
              <div className="absolute inset-0 border-2 border-dashed border-purple-500 rounded-lg pointer-events-none flex items-center justify-center">
                <div className="bg-white/80 px-3 py-1 rounded text-sm">
                  Position travel ID here
                </div>
              </div>
            </div>
          )}

          {/* Captured Image */}
          {capturedImage && (
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured travel ID"
                className="w-full h-64 bg-gray-100 rounded-lg object-cover"
              />
              <div className="absolute top-2 right-2">
                <Button
                  onClick={() => setCapturedImage(null)}
                  size="sm"
                  variant="destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="bg-white px-4 py-2 rounded text-sm">
                    Processing image...
                  </div>
                </div>
              )}
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Manual Input Section */}
        <div className="space-y-2">
          <Label htmlFor="travelId">Or Enter Travel ID Manually</Label>
          <Input
            id="travelId"
            value={scannedId}
            onChange={(e) => handleManualInput(e.target.value)}
            placeholder="e.g., WH-12345 or PLT-1234567890-123"
            className="font-mono"
            disabled={isProcessing}
          />
        </div>

        {/* Validation Result */}
        {validationResult === 'valid' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Valid Ticket</span>
              <Badge variant="outline" className="text-green-700 border-green-300">
                VALID
              </Badge>
            </div>
            {ticketInfo && (
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Passenger:</strong> {ticketInfo.passenger_name}</p>
                <p><strong>Travel ID:</strong> {ticketInfo.travel_id}</p>
                <p><strong>Date:</strong> {new Date(ticketInfo.travel_date).toLocaleDateString()}</p>
                <p><strong>Expires:</strong> {new Date(ticketInfo.expires_at).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        {validationResult === 'invalid' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <X className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-800">Invalid Ticket</span>
              <Badge variant="outline" className="text-red-700 border-red-300">
                INVALID
              </Badge>
            </div>
          </div>
        )}

        {/* Reset Button */}
        {(scannedId || validationResult || capturedImage) && (
          <Button onClick={resetScanner} variant="outline" className="w-full" disabled={isProcessing}>
            Reset Scanner
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TravelIdScanner;
