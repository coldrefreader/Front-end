import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function BackButton({ setIsLeaving }) {
  const navigate = useNavigate();

  const handleBack = () => {
    setIsLeaving(true);
    setTimeout(() => navigate(-1), 800); // Wait for animation before going back
  };

  return (
    <motion.button
      className="back-button"
      whileHover={{ scale: 1.1, filter: "brightness(1.2)" }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
      onClick={handleBack}
    >
      Back
    </motion.button>
  );
}