"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, X } from "lucide-react";
import { ImageUploader } from "@/components/common/ImageUploader";
import { z } from "zod";
import { toast } from "sonner";
import { deleteImageKitFile } from "@/lib/imageKit";
import { Badge } from "@/components/ui/badge";

// Validation schema
const createFamilySchema = z.object({
  familyName: z.string().min(1, "Family name is required").max(100, "Family name is too long"),
  shortName: z.string().max(60).optional(),
  contactName: z.string().max(120).optional(),
  contactPhone: z.string().max(30).optional(),
  contactEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
  description: z.string().optional(),
  colors: z.string().optional(),
  info: z.array(z.record(z.any())).optional().default([]),
  images: z.array(z.string()).optional().default([]),
});

export function FamilyForm({
  onSubmit,
  onCancel,
  loading,
  initialData = null,
}) {
  const [formData, setFormData] = useState({
    familyName: initialData?.familyName || "",
    shortName: initialData?.shortName || "",
    contactName: initialData?.contactName || "",
    contactPhone: initialData?.contactPhone || "",
    contactEmail: initialData?.contactEmail || "",
    status: initialData?.status || "ACTIVE",
    description: initialData?.description || "",
    colors: initialData?.colors || "",
    info: initialData?.info || [],
    images: initialData?.images || [],
  });

  const [errors, setErrors] = useState({});
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [colorInput, setColorInput] = useState("");
  const [colorArray, setColorArray] = useState([]);
  const [infoInput, setInfoInput] = useState({ key: "", value: "" });

  // Initialize color array from colors string
  useEffect(() => {
    if (formData.colors) {
      const colors = formData.colors.includes(",")
        ? formData.colors.split(",").map((c) => c.trim())
        : [formData.colors];
      setColorArray(colors.filter(Boolean));
    }
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImagesUpload = (uploadedImages) => {
    if (uploadedImages && uploadedImages.length > 0) {
      const imageUrls = uploadedImages.map((img) => img.url);
      handleChange("images", [...formData.images, ...imageUrls]);
    }
  };

  const handleImageRemove = (imageUrl) => {
    // Extract fileId from imageUrl if needed for deletion
    // Assuming imageUrl contains the fileId or we track it separately
    const updatedImages = formData.images.filter((img) => img !== imageUrl);
    handleChange("images", updatedImages);
    
    // Mark for deletion if it's an existing image
    if (initialData?.images?.includes(imageUrl)) {
      // Extract fileId from URL if needed
      // setImagesToDelete((prev) => [...prev, fileId]);
    }
  };

  // Color management
  const handleAddColor = () => {
    if (!colorInput.trim()) return;
    
    const newColor = colorInput.trim();
    if (!colorArray.includes(newColor)) {
      const updatedColors = [...colorArray, newColor];
      setColorArray(updatedColors);
      handleChange("colors", updatedColors.join(", "));
    }
    setColorInput("");
  };

  const handleRemoveColor = (colorToRemove) => {
    const updatedColors = colorArray.filter((c) => c !== colorToRemove);
    setColorArray(updatedColors);
    handleChange("colors", updatedColors.join(", "));
  };

  // Info management (Json array)
  const handleAddInfo = () => {
    if (!infoInput.key.trim() || !infoInput.value.trim()) {
      toast.error("Both key and value are required");
      return;
    }

    const newInfo = { [infoInput.key]: infoInput.value };
    handleChange("info", [...formData.info, newInfo]);
    setInfoInput({ key: "", value: "" });
  };

  const handleRemoveInfo = (index) => {
    const updatedInfo = formData.info.filter((_, idx) => idx !== index);
    handleChange("info", updatedInfo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = createFamilySchema.parse(formData);

      // Submit the form
      await onSubmit(validated);

      // After successful submission, delete old images
      if (imagesToDelete.length > 0) {
        try {
          await Promise.allSettled(
            imagesToDelete.map((fileId) => deleteImageKitFile(fileId))
          );
        } catch (error) {
          console.error("Failed to delete old images:", error);
          // Don't show error to user as the main operation succeeded
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0];
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
        toast.error(error.errors[0].message);
      } else {
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Family Name */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="familyName">
            Family Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="familyName"
            value={formData.familyName}
            onChange={(e) => handleChange("familyName", e.target.value)}
            placeholder="Enter family name"
            className={`h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
              errors.familyName ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.familyName && (
            <p className="text-sm text-red-500">{errors.familyName}</p>
          )}
        </div>

        <div className="space-y-2"><Label htmlFor="shortName">Short name</Label><Input id="shortName" value={formData.shortName} onChange={(e)=>handleChange("shortName", e.target.value)} placeholder="Display abbreviation" /></div>
        <div className="space-y-2"><Label htmlFor="status">Directory status</Label><select id="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.status} onChange={(e)=>handleChange("status", e.target.value)}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="SUSPENDED">Suspended</option></select></div>
        <div className="space-y-2"><Label htmlFor="contactName">Representative</Label><Input id="contactName" value={formData.contactName} onChange={(e)=>handleChange("contactName", e.target.value)} placeholder="Family/team representative" /></div>
        <div className="space-y-2"><Label htmlFor="contactPhone">Contact phone</Label><Input id="contactPhone" value={formData.contactPhone} onChange={(e)=>handleChange("contactPhone", e.target.value)} placeholder="Phone number" /></div>
        <div className="space-y-2 md:col-span-2"><Label htmlFor="contactEmail">Contact email</Label><Input id="contactEmail" type="email" value={formData.contactEmail} onChange={(e)=>handleChange("contactEmail", e.target.value)} placeholder="team@example.com" /></div>

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Brief description of the family"
            rows={3}
            className={`border-gray-300 focus:border-orange-500 focus:ring-orange-500 ${
              errors.description ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Colors */}
        <div className="space-y-2 md:col-span-2">
          <Label>Team Colors</Label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                placeholder="Enter color (e.g., #FF5733 or red)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddColor();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddColor}
                variant="outline"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {colorArray.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {colorArray.map((color, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="pl-1 pr-2 py-1 flex items-center gap-2"
                  >
                    <div
                      className="h-4 w-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                    <span>{color}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(color)}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2 md:col-span-2">
          <Label>Additional Information</Label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={infoInput.key}
                onChange={(e) =>
                  setInfoInput((prev) => ({ ...prev, key: e.target.value }))
                }
                placeholder="Key (e.g., founded)"
                className="flex-1"
              />
              <Input
                value={infoInput.value}
                onChange={(e) =>
                  setInfoInput((prev) => ({ ...prev, value: e.target.value }))
                }
                placeholder="Value (e.g., 2020)"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddInfo();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddInfo}
                variant="outline"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.info.length > 0 && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                {formData.info.map((item, idx) => {
                  const [key, value] = Object.entries(item)[0];
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-sm">{key}:</span>{" "}
                        <span className="text-sm text-gray-600">{value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveInfo(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Images Upload */}
      <div className="space-y-2">
        <Label>Family Images</Label>
        <ImageUploader
          onUploadComplete={handleImagesUpload}
          onImageRemove={handleImageRemove}
          folder="/families"
          multiple={true}
          existingImages={formData.images.map((url, idx) => ({
            url,
            id: `img-${idx}`,
          }))}
        />
        {errors.images && (
          <p className="text-sm text-red-500">{errors.images}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Upload multiple images to showcase the family. Recommended size: 800x600px
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update" : "Create"} Family
        </Button>
      </div>
    </form>
  );
}