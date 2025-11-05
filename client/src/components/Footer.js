import React from "react";

const Footer = () => {
  return (
    <footer className="footer-container text-light text-center">
      <div className="footer-content container py-3">

        {/* Social & Contact Icons */}
        <div className="d-flex justify-content-center gap-4 mb-2">
          {/* 📞 Phone */}
          <a
            href="tel:+917010085823"
            className="social-icon"
            title="Call Us"
          >
            <i className="bi bi-telephone-fill"></i>
          </a>

          {/* 💬 WhatsApp */}
          <a
            href="https://wa.me/917010085823"
            target="_blank"
            rel="noreferrer"
            className="social-icon"
            title="Chat on WhatsApp"
          >
            <i className="bi bi-whatsapp"></i>
          </a>

          {/* 📷 Instagram */}
          <a
            href="https://www.instagram.com/vicky_arav_/"
            target="_blank"
            rel="noreferrer"
            className="social-icon"
            title="Instagram"
          >
            <i className="bi bi-instagram"></i>
          </a>

          {/* ✉️ Email */}
          <a
            href="mailto:vigneshjan03@gmail.com"
            className="social-icon"
            title="Email"
          >
            <i className="bi bi-envelope-fill"></i>
          </a>
        </div>

        {/* Footer Info */}
        <small className="d-block">
          © {new Date().getFullYear()} <strong>Vicky Taxi</strong> • All Rights Reserved
        </small>
        <small style={{ opacity: 0.8 }}>
          Made with ❤️ by <strong>Vicky Arav</strong>
        </small>
      </div>

      <style>{`
        .footer-container {
          position: relative;
          background: #0b0b0b;
          margin-top: 0;
          padding: 0.6rem 0 0.8rem 0;
          border-top: 3px solid transparent;
          background-clip: padding-box;
          min-height: 80px;
          box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.3);
        }

        /* Gradient top border */
        .footer-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #00ffcc, #007bff, #ff00ff);
          background-size: 200% 200%;
          animation: gradientMove 6s linear infinite;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .text-gradient {
          background: linear-gradient(90deg, #00ffcc, #ff00ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 0.5px;
        }

        .social-icon {
          font-size: 1.4rem;
          color: #ccc;
          transition: all 0.3s ease;
        }

        .social-icon:hover {
          color: #00ffcc;
          transform: scale(1.2);
          text-shadow: 0 0 10px #00ffcc;
        }

        .footer-content {
          animation: fadeInUp 1s ease;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .footer-container {
            min-height: 90px;
          }
          .social-icon {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
