import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, FileText, Menu } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible";

const NavigationBar = ({
  onMenuClick = () => console.log("Menu clicked"),
  onLogoClick = () => console.log("Logo clicked"),
  onLegislationClick = () => console.log("Legislation tracker clicked"),
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null); // State to store user information

  // Simulate fetching user data (replace with actual authentication logic)
  useEffect(() => {
    const fetchUser = async () => {
      // Example: Fetch user data from localStorage or an API
      const token = localStorage.getItem("token");
      if (token) {
        const userData = { role: "user" }; // Replace with actual user data
        setUser(userData);
      }
    };

    fetchUser();
  }, []);

  // Define navigation links based on user role
  const getNavLinks = () => {
    if (!user) {
      // Unauthorized user
      return ["login", "register"];
    } else if (user.role === "user") {
      // Regular user
      return ["post"];
    } else if (user.role === "admin") {
      // Admin user
      return ["create category", "create tag"];
    }
    return [];
  };

  // Define profile dropdown links based on user role
  const getProfileLinks = () => {
    if (user) {
      return ["Your profile", "Logout"];
    }
    return [];
  };

  const navLinks = getNavLinks();
  const profileLinks = getProfileLinks();

  return (
    <div>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="bg-gray-800 px-5 py-3 mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <Link to="/" onClick={onLogoClick} className="text-xl font-bold text-white">
              Share your ideas here 
              </Link>
            </div>

            <div className="hidden lg:block">
              <div className="flex items-center space-x-5">
                <form>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      placeholder="Search topics"
                      className="pl-8 bg-gray-700 text-white outline-none border-none"
                    />
                  </div>
                </form>
                {navLinks.map((link, index) => (
                  <button key={index} className="text-gray-200 hover:bg-gray-700 px-3 py-2">
                    {link}
                  </button>
                ))}
                {user && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Avatar className="w-9 h-9 cursor-pointer">
                        <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    </PopoverTrigger>
                    <PopoverContent className="bg-white p-2 shadow-lg">
                      {profileLinks.map((link, index) => (
                        <div key={index} className="p-2 hover:bg-gray-100">
                          {link}
                        </div>
                      ))}
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            <CollapsibleTrigger asChild>
              <button onClick={onMenuClick} className="lg:hidden">
                <Menu className="h-10 w-10 text-white" />
              </button>
            </CollapsibleTrigger>
          </div>
        </div>
      </Collapsible>
    </div>
  );
};

export default NavigationBar;