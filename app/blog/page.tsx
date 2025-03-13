"use client";
import { title, subtitle } from "@/components/primitives";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/react";
import { Link } from "@heroui/link";
import { FaCalendarAlt } from "react-icons/fa";

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: "Introduction to Next.js",
      description: "Learn the basics of Next.js and how to build modern web applications.",
      date: "2023-10-01",
    },
    {
      id: 2,
      title: "Advanced React Patterns",
      description: "Explore advanced React patterns to improve your codebase.",
      date: "2023-10-05",
    },
    {
      id: 3,
      title: "Building a Blog with Tailwind CSS",
      description: "A step-by-step guide to building a responsive blog using Tailwind CSS.",
      date: "2023-10-10",
    },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col p-6 bg-background dark:bg-background-gray-900 ">
      <h1 className={title()}>Blog</h1>
      <p className={subtitle()}>Welcome to our blog. Here you can find the latest articles.</p>

      <div className="mt-8 space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <h2 className="text-xl font-semibold">{post.title}</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 dark:text-gray-400">{post.description}</p>
            </CardBody>
            <CardFooter className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <FaCalendarAlt />
              <span>{post.date}</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}