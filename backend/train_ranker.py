import pandas as pd
from sentence_transformers import SentenceTransformer, util

class ResumeRankerModel:
    def __init__(self, dataset_path: str = "jobs_dataset_with_features.xlsx"):
        # Load the model
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Load your dataset
        self.df = pd.read_excel(dataset_path)
        
        # Precompute embeddings for all job roles/features in your dataset for fast comparison
        self.job_features = self.df['Features'].fillna("").tolist()
        self.job_roles = self.df['Role'].fillna("").tolist()
        self.feature_embeddings = self.model.encode(self.job_features, convert_to_tensor=True)

    def rank_against_dataset(self, resume_text: str, top_k: int = 3):
        """
        Compares a resume against all jobs in your dataset and returns the top matching roles.
        """
        resume_embedding = self.model.encode(resume_text, convert_to_tensor=True)
        
        # Compute cosine similarity between resume and all dataset entries
        cos_scores = util.cos_sim(resume_embedding, self.feature_embeddings)[0]
        
        # Get top matching indices
        top_results = torch.topk(cos_scores, k=min(top_k, len(self.df)))
        
        matches = []
        for score, idx in zip(top_results.values, top_results.indices):
            matches.endswith({
                "role": self.job_roles[idx.item()],
                "features": self.job_features[idx.item()],
                "match_score": round(float(score.item()) * 100, 2)
            })
        return matches