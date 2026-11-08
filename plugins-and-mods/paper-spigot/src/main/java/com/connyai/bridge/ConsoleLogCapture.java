package com.connyai.bridge;

import java.io.File;
import java.io.RandomAccessFile;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.logging.Handler;
import java.util.logging.LogRecord;
import java.util.logging.Logger;

public class ConsoleLogCapture {

    private final Deque<String> recentLogs = new ConcurrentLinkedDeque<>();
    private static final int MAX_BUFFER_LINES = 1000;
    private Handler logHandler;

    public void start() {
        logHandler = new Handler() {
            @Override
            public void publish(LogRecord record) {
                if (record != null && record.getMessage() != null) {
                    addLine("[" + record.getLevel() + "] " + record.getMessage());
                }
            }

            @Override
            public void flush() {}

            @Override
            public void close() throws SecurityException {}
        };

        try {
            Logger.getLogger("").addHandler(logHandler);
        } catch (Exception e) {
            // fallback if global logger access restricted
        }
    }

    public void stop() {
        if (logHandler != null) {
            try {
                Logger.getLogger("").removeHandler(logHandler);
            } catch (Exception ignored) {}
        }
    }

    public void addLine(String line) {
        recentLogs.addLast(line);
        while (recentLogs.size() > MAX_BUFFER_LINES) {
            recentLogs.pollFirst();
        }
    }

    public List<String> getRecentLogs(int limit) {
        List<String> list = new ArrayList<>(recentLogs);
        if (list.size() <= limit) {
            return list;
        }
        return list.subList(list.size() - limit, list.size());
    }

    public static List<String> readLatestLogFile(int maxLines) {
        List<String> lines = new ArrayList<>();
        File logFile = new File("logs/latest.log");
        if (!logFile.exists() || !logFile.canRead()) {
            return lines;
        }

        try (RandomAccessFile raf = new RandomAccessFile(logFile, "r")) {
            long length = raf.length();
            long pos = length - 1;
            int count = 0;
            StringBuilder sb = new StringBuilder();

            while (pos >= 0 && count < maxLines) {
                raf.seek(pos);
                int b = raf.read();
                if (b == '\n') {
                    if (sb.length() > 0) {
                        lines.add(0, sb.reverse().toString());
                        sb.setLength(0);
                        count++;
                    }
                } else if (b != '\r') {
                    sb.append((char) b);
                }
                pos--;
            }
            if (sb.length() > 0 && count < maxLines) {
                lines.add(0, sb.reverse().toString());
            }
        } catch (Exception e) {
            // ignore
        }
        return lines;
    }
}
