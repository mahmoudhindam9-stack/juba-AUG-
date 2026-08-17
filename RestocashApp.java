import java.awt.Desktop;
import java.net.URI;
import javax.swing.*;

public class RestocashApp {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try {
                // Ensure server is started via batch/process
                String appUrl = "http://localhost:3000";
                
                // Create Java GUI Splash Window
                JFrame frame = new JFrame("Restocash ERP - Desktop Application");
                frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
                frame.setSize(500, 300);
                frame.setLocationRelativeTo(null);

                JPanel panel = new JPanel();
                panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
                panel.setBorder(BorderFactory.createEmptyBorder(30, 30, 30, 30));

                JLabel titleLabel = new JLabel("Restocash ERP System");
                titleLabel.setFont(new java.awt.Font("Arial", java.awt.Font.BOLD, 22));
                titleLabel.setAlignmentX(JLabel.CENTER_ALIGNMENT);

                JLabel statusLabel = new JLabel("Application server is running on " + appUrl);
                statusLabel.setFont(new java.awt.Font("Arial", java.awt.Font.PLAIN, 14));
                statusLabel.setAlignmentX(JLabel.CENTER_ALIGNMENT);

                JButton openButton = new JButton("Open Restocash ERP Window");
                openButton.setFont(new java.awt.Font("Arial", java.awt.Font.BOLD, 14));
                openButton.setAlignmentX(JButton.CENTER_ALIGNMENT);
                openButton.addActionListener(e -> {
                    try {
                        if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                            Desktop.getDesktop().browse(new URI(appUrl));
                        }
                    } catch (Exception ex) {
                        ex.printStackTrace();
                    }
                });

                panel.add(titleLabel);
                panel.add(Box.createVerticalStrut(20));
                panel.add(statusLabel);
                panel.add(Box.createVerticalStrut(30));
                panel.add(openButton);

                frame.add(panel);
                frame.setVisible(true);

                // Auto-open browser application window
                if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                    Desktop.getDesktop().browse(new URI(appUrl));
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }
}
