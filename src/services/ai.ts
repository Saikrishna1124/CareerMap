const fallbackCodingQuestion = {
  title: "Two Sum Target",
  difficulty: "Easy",
  description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
  constraints: "2 <= nums.length <= 1000\n-10^9 <= target <= 10^9",
  samples: [
    {
      input: "nums = [2, 7, 11, 15], target = 9",
      output: "[0, 1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
    }
  ],
  starterCode: {
    python: "def twoSum(nums, target):\n    # Write Python 3 solution\n    pass",
    javascript: "function twoSum(nums, target) {\n    // Write JavaScript solution\n    return [];\n}",
    cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write C++ solution\n        return {};\n    }\n};",
    java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write Java solution\n        return new int[0];\n    }\n}"
  },
  testCases: [
    { input: "[2, 7, 11, 15], 9", output: "[0, 1]" },
    { input: "[3, 2, 4], 6", output: "[1, 2]" },
    { input: "[3, 3], 6", output: "[0, 1]" }
  ]
};

export async function getInterviewQuestions(role: string, type: string) {
  try {
    const res = await fetch('/api/interview/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ role, type })
    });
    if (!res.ok) throw new Error('Failed to fetch questions');
    return await res.json();
  } catch (error) {
    console.error("Questions error:", error);
    if (type === 'Coding') {
      return [JSON.stringify(fallbackCodingQuestion)];
    }
    return [
      "Tell me about yourself.",
      "What are your strengths and weaknesses?",
      "Why do you want to work here?",
      "Describe a challenging project you worked on.",
      "Where do you see yourself in 5 years?"
    ];
  }
}

export async function getChatbotResponse(message: string, context: string) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ message, context })
    });
    if (!res.ok) throw new Error('Chat failed');
    const data = await res.json();
    return data.text;
  } catch (error) {
    return "I'm sorry, I'm having trouble connecting right now.";
  }
}

export async function* streamChatResponse(message: string, context: string) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ message, context, stream: true })
    });

    if (!res.ok) throw new Error('Streaming failed');

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const cleaned = line.replace(/^data: /, '');
        if (!cleaned || cleaned === '[DONE]') continue;

        try {
          const parsed = JSON.parse(cleaned);
          if (parsed.error) {
            yield `[ERROR]: ${parsed.error}`;
            return;
          }
          if (parsed.text) yield parsed.text;
        } catch (e) {
          console.error("Parse error in stream:", e);
        }
      }
    }
  } catch (error) {
    console.error("Stream error:", error);
    yield "I encountered an error while responding. Please try again soon.";
  }
}
