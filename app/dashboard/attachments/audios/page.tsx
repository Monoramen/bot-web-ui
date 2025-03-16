"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { title } from "@/components/Primitives";
import { Button } from "@heroui/react";
import { FaPlus, FaMusic } from "react-icons/fa";

interface AudioAttachmentDTO {
  id: number;
  title: string;
  artist: string;
  duration: number; // Длительность в секундах
  source: string; // Источник (например, YouTube, Spotify и т.д.)
  url: string; // Ссылка на аудио
}

export default function AudioAttachmentsPage() {
  const [audioAttachments, setAudioAttachments] = useState<AudioAttachmentDTO[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<AudioAttachmentDTO | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchAudioAttachments = async () => {
    try {
      const response = await axios.get("http://localhost:9090/attachments/audio");
      setAudioAttachments(response.data);
    } catch (error) {
      console.error("Error fetching audio attachments", error);
    }
  };

  useEffect(() => {
    fetchAudioAttachments();
  }, []);

  const handleSelectAudio = (audio: AudioAttachmentDTO) => {
    setSelectedAudio(audio);
  };

  const handleAddAudio = () => {
    setShowAddForm((prev) => !prev);
    setSelectedAudio(null);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setSelectedAudio(null);
  };

  const handleAudioUpdated = () => {
    fetchAudioAttachments();
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center mb-8 px-4">
        <h1 className={title()}>Audio Attachments</h1>
        <Button
          className="p-0 w-12 h-12 flex items-center justify-center"
          onClick={handleAddAudio}
          color="success"
          size="md"
        >
          <FaPlus />
        </Button>
      </div>

      {/* Table for Audio Attachments */}
      <div className="flex-1 px-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Title</th>
              <th className="border border-gray-300 p-2">Artist</th>
              <th className="border border-gray-300 p-2">Duration</th>
              <th className="border border-gray-300 p-2">Source</th>
            </tr>
          </thead>
          <tbody>
            {audioAttachments.map((audio) => (
              <tr
                key={audio.id}
                className="hover:bg-gray-500 cursor-pointer"
                onClick={() => handleSelectAudio(audio)}
              >
                <td className="border border-gray-500 p-2 text-center">{audio.id}</td>
                <td className="border border-gray-500 p-2 text-center">{audio.title}</td>
                <td className="border border-gray-500 p-2 text-center">{audio.artist}</td>
                <td className="border border-gray-500 p-2 text-center">
                  {Math.floor(audio.duration / 60)}:{audio.duration % 60 < 10 ? "0" : ""}
                  {audio.duration % 60}
                </td>
                <td className="border border-gray-500 p-2 text-center">{audio.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Additional Forms or Modals */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Add New Audio Attachment</h2>
            {/* Add form fields here */}
            <div className="flex justify-end gap-2">
              <Button onClick={handleCancel} color="danger">
                Cancel
              </Button>
              <Button onClick={handleAudioUpdated} color="success">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Audio Details */}
      {selectedAudio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-semibold">{selectedAudio.title}</h2>
            <p>Artist: {selectedAudio.artist}</p>
            <p>
              Duration: {Math.floor(selectedAudio.duration / 60)}:
              {selectedAudio.duration % 60 < 10 ? "0" : ""}
              {selectedAudio.duration % 60}
            </p>
            <p>Source: {selectedAudio.source}</p>
            <p>
              URL: <a href={selectedAudio.url} className="text-blue-500 hover:underline">{selectedAudio.url}</a>
            </p>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setSelectedAudio(null)} color="danger">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}