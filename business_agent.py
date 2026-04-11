"""
Business Agent for 360virtual
A virtual business assistant for the CTO Education GitHub pack.
"""

import os
import json
import logging
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BusinessAgent:
    """A virtual business agent for 360-degree business simulations."""

    def __init__(self, name: str = "360 Business Agent", api_key: Optional[str] = None):
        self.name = name
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.conversation_history = []
        logger.info("BusinessAgent '%s' initialized.", self.name)

    def upgrade(self, package_name: str) -> str:
        """Simulate upgrading a package or dependency."""
        logger.info("Upgrading: %s", package_name)
        return f"Successfully upgraded: {package_name}"

    def process(self, user_input: str) -> str:
        """Process a user message and return a response."""
        self.conversation_history.append({"role": "user", "content": user_input})
        response = self._generate_response(user_input)
        self.conversation_history.append({"role": "assistant", "content": response})
        return response

    def _generate_response(self, user_input: str) -> str:
        """Generate a response to user input."""
        tokens = user_input.strip().split()
        if tokens and tokens[0].lower() == "upgrade":
            package_name = " ".join(tokens[1:]) if len(tokens) > 1 else ""
            return self.upgrade(package_name) if package_name else f"[{self.name}] Please specify a package to upgrade."
        return f"[{self.name}] Processing: {user_input}"

    def export_history(self) -> str:
        """Export conversation history as JSON."""
        return json.dumps(self.conversation_history, indent=2)


def main():
    agent = BusinessAgent()
    print(agent.process("upgrade upgrade"))


if __name__ == "__main__":
    main()
