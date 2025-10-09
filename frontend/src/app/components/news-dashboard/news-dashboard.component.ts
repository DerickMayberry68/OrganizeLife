import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  category: string;
  imageUrl?: string;
}

@Component({
  selector: 'news-dashboard',
  templateUrl: './news-dashboard.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class NewsDashboardComponent implements OnInit {
  newsItems: NewsItem[] = [
    {
      id: 1,
      title: 'New Agricultural Technology Improves Crop Yield by 25%',
      summary: 'Latest research shows significant improvements in crop productivity using advanced farming techniques.',
      source: 'Agricultural Weekly',
      publishedAt: '2 hours ago',
      category: 'Technology',
      imageUrl: 'assets/img/theme/news1.jpg'
    },
    {
      id: 2,
      title: 'Weather Patterns Favor Spring Planting Season',
      summary: 'Meteorologists predict optimal conditions for the upcoming planting season across the region.',
      source: 'Farm Journal',
      publishedAt: '4 hours ago',
      category: 'Weather'
    },
    {
      id: 3,
      title: 'Government Announces New Farm Subsidy Program',
      summary: 'New financial assistance program aims to support sustainable farming practices.',
      source: 'Rural News',
      publishedAt: '6 hours ago',
      category: 'Policy'
    },
    {
      id: 4,
      title: 'Precision Agriculture Tools Reduce Water Usage',
      summary: 'Smart irrigation systems help farmers conserve water while maintaining crop health.',
      source: 'Green Farming',
      publishedAt: '8 hours ago',
      category: 'Sustainability'
    }
  ];

  categories = ['All', 'Technology', 'Weather', 'Policy', 'Sustainability'];
  selectedCategory = 'All';

  ngOnInit() {
    // In a real application, this would fetch data from a news API
    this.loadNewsData();
  }

  private loadNewsData() {
    // Simulate API call
    // This would typically call a news service
  }

  getFilteredNews() {
    if (this.selectedCategory === 'All') {
      return this.newsItems;
    }
    return this.newsItems.filter(item => item.category === this.selectedCategory);
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
  }

  getCategoryClass(category: string): string {
    const classes: { [key: string]: string } = {
      'Technology': 'badge-primary',
      'Weather': 'badge-info',
      'Policy': 'badge-warning',
      'Sustainability': 'badge-success'
    };
    return classes[category] || 'badge-secondary';
  }
}

