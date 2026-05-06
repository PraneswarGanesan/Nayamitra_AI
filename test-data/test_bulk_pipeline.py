import os
import subprocess

TEST_FOLDER = "test-data"
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))

def run_test(file_path):
    try:
        result = subprocess.run(
            ["python", "-m", "tests.test_pipeline", os.path.abspath(file_path)],
            capture_output=True,
            text=True,
            cwd=BACKEND_DIR,
        )
        return result.stdout
    except Exception as e:
        return str(e)

def main():
    for root, dirs, files in os.walk(TEST_FOLDER):
        for file in files:
            if file.endswith(".pdf"):
                file_path = os.path.join(root, file)
                print(f"\nProcessing: {file_path}")
                output = run_test(file_path)
                print(output)

if __name__ == "__main__":
    main()